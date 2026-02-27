// Status polling endpoint for async generation jobs
// Handles both Atlas Cloud and CivitAI async responses
// On completion: downloads image → uploads to B2 → saves to Supabase → deducts credits → returns permanent URL

import { downloadAndUploadToB2 } from '../../lib/b2-client';
import { saveGeneration, getSupabaseServer } from '../../lib/supabase-server';
import { getCivitaiClient } from '../../lib/civitai-client';

/**
 * Generate a unique filename for B2 storage.
 */
function generateFileName(userId: string, mediaType: 'image' | 'video'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = mediaType === 'video' ? 'mp4' : 'png';
    return `generations/${userId}/${timestamp}_${random}.${ext}`;
}

/**
 * Deduct credits after a successful generation.
 */
async function deductCreditsOnSuccess(
    serviceKey: string,
    userId: string,
    creditType: 'gems' | 'crystals',
    amount: number
): Promise<void> {
    const supabase = getSupabaseServer(serviceKey);
    const column = creditType;

    const { data: credits } = await supabase
        .from('user_credits')
        .select('gems, crystals')
        .eq('user_id', userId)
        .single();

    if (!credits) return;

    await supabase
        .from('user_credits')
        .update({
            [column]: Math.max(0, credits[column] - amount),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    console.log(`[CREDITS] Deducted ${amount} ${creditType} after successful async job. User: ${userId}. Was: ${credits[column]}, Now: ${Math.max(0, credits[column] - amount)}`);
}

export async function onRequestGet(context: any) {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        console.log('[STATUS] Polling request:', url.search);
        const provider = url.searchParams.get('provider'); // 'atlas' or 'civitai'
        const jobId = url.searchParams.get('jobId');       // Atlas Cloud job ID
        const token = url.searchParams.get('token');       // CivitAI token
        const userId = url.searchParams.get('userId');
        const prompt = url.searchParams.get('prompt') || '';
        const modelId = parseInt(url.searchParams.get('modelId') || '0', 10);
        const mediaType = (url.searchParams.get('mediaType') || 'image') as 'image' | 'video';

        // Parse settings JSON from query param
        let settings: Record<string, any> | undefined;
        try {
            const settingsParam = url.searchParams.get('settings');
            if (settingsParam) settings = JSON.parse(settingsParam);
        } catch { /* ignore parse errors */ }

        // Parse credit cost from query param (passed by frontend from the generate response)
        let creditCost: { type: 'gems' | 'crystals'; cost: number } | null = null;
        try {
            const creditCostParam = url.searchParams.get('creditCost');
            if (creditCostParam) creditCost = JSON.parse(creditCostParam);
        } catch { /* ignore parse errors */ }

        if (!provider) {
            return new Response(JSON.stringify({ error: "Provider is required (atlas or civitai)" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ============================================
        // ATLAS CLOUD POLLING
        // Uses job ID from initial generateImage/generateVideo response
        // Status endpoint: GET /api/v1/model/status/{id}
        // ============================================
        if (provider === 'atlas') {
            if (!jobId) {
                return new Response(JSON.stringify({ error: "jobId is required for Atlas Cloud" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const atlasKey = env.ATLAS_CLOUD_API_KEY;
            if (!atlasKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            const statusResponse = await fetch(`https://api.atlascloud.ai/api/v1/model/prediction/${jobId}`, {
                headers: { "Authorization": `Bearer ${atlasKey}` },
            });

            if (!statusResponse.ok) {
                const errData = await statusResponse.json().catch(() => ({ error: "Unknown" }));
                throw new Error(errData.error || `Atlas status check failed: ${statusResponse.status}`);
            }

            const rawStatusData = await statusResponse.json() as any;
            console.log('[STATUS] Atlas poll raw response:', JSON.stringify(rawStatusData).substring(0, 500));

            // Atlas Cloud wraps responses: {code: 200, data: {status, outputs, ...}}
            // Unwrap to get the actual status object
            const statusData = rawStatusData.data || rawStatusData;

            // Job still processing
            if (statusData.status === 'processing' || statusData.status === 'starting' || statusData.status === 'in_queue' || statusData.status === 'created') {
                return new Response(JSON.stringify({
                    status: 'processing',
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Job failed
            if (statusData.status === 'failed' || statusData.status === 'error') {
                return new Response(JSON.stringify({
                    status: 'failed',
                    error: statusData.error || 'Generation failed',
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Job completed — extract temp URL, upload to B2, save to Supabase
            if (statusData.status === 'completed' || statusData.status === 'success') {
                // After unwrapping, outputs are directly on statusData
                const tempUrl = statusData.outputs?.[0]           // Atlas Cloud primary format
                    || statusData.output?.url
                    || statusData.output?.image_url
                    || statusData.output?.video_url
                    || (statusData.output?.images && statusData.output.images[0]?.url)
                    || statusData.url
                    || statusData.image_url;

                console.log('[STATUS] Atlas completed. Extracted URL:', tempUrl ? tempUrl.substring(0, 200) : 'NULL');

                if (!tempUrl) {
                    return new Response(JSON.stringify({
                        status: 'completed',
                        error: 'No output URL found in response',
                        rawResponse: statusData,
                        provider: 'atlas',
                    }), {
                        headers: { "Content-Type": "application/json" },
                    });
                }

                // Upload to B2
                const fileName = generateFileName(userId || 'anonymous', mediaType);
                const contentType = mediaType === 'video' ? 'video/mp4' : 'image/png';
                const permanentUrl = await downloadAndUploadToB2(env, tempUrl, fileName, contentType);

                // Save to Supabase
                let generationId = null;
                if (userId && env.SUPABASE_SERVICE_KEY) {
                    try {
                        generationId = await saveGeneration(env.SUPABASE_SERVICE_KEY, {
                            user_id: userId,
                            media_url: permanentUrl,
                            media_type: mediaType,
                            prompt: prompt,
                            model_id: modelId,
                            settings: settings,
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
                }

                // Deduct credits AFTER successful async completion
                if (creditCost && userId && env.SUPABASE_SERVICE_KEY) {
                    await deductCreditsOnSuccess(env.SUPABASE_SERVICE_KEY, userId, creditCost.type, creditCost.cost);
                }

                return new Response(JSON.stringify({
                    status: 'completed',
                    mediaUrl: permanentUrl,
                    generationId,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Unknown status — return raw
            return new Response(JSON.stringify({
                status: statusData.status || 'unknown',
                rawResponse: statusData,
                provider: 'atlas',
            }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // ============================================
        // CIVITAI POLLING
        // Uses 'token' from initial fromText() response
        // Poll with civitai.jobs.get(token)
        // Completed results have 'blobUrl'
        // ============================================
        if (provider === 'civitai') {
            if (!token) {
                return new Response(JSON.stringify({ error: "token is required for CivitAI" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const apiToken = env.CIVITAI_API_TOKEN;
            if (!apiToken) throw new Error("Missing CIVITAI_API_TOKEN");

            console.log('[STATUS] Checking CivitAI token:', token);
            const civitai = getCivitaiClient(apiToken);

            const jobStatus = await civitai.jobs.getByToken(token);
            console.log('[STATUS] CivitAI response:', JSON.stringify(jobStatus).substring(0, 500));

            // Check if all jobs have completed
            // NOTE: CivitAI returns result as an ARRAY, e.g. result: [{available: true, blobUrl: '...'}]
            // available: false means STILL PROCESSING (not failed!)
            // available: true means DONE
            const jobs = jobStatus.jobs || [];
            const allCompleted = jobs.length > 0 && jobs.every((j: any) => {
                const results = Array.isArray(j.result) ? j.result : (j.result ? [j.result] : []);
                return results.length > 0 && results.every((r: any) => r.available === true);
            });

            console.log('[STATUS] allCompleted:', allCompleted, 'jobCount:', jobs.length);

            // Not done yet — keep polling
            if (!allCompleted) {
                return new Response(JSON.stringify({
                    status: 'processing',
                    provider: 'civitai',
                    jobCount: jobs.length,
                }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // All completed — upload each result to B2
            console.log('[STATUS] All CivitAI jobs completed! Jobs:', jobs.length);
            const completedResults: Array<{ mediaUrl: string; generationId: string | null }> = [];

            // Use the CivitAI token as the batch_id — all images from this generation share it
            const batchId = token;

            for (const job of jobs) {
                // CivitAI result is an ARRAY of items, each with blobUrl
                const resultItems = Array.isArray(job.result) ? job.result : (job.result ? [job.result] : []);

                for (const resultItem of resultItems) {
                    const blobUrl = resultItem?.blobUrl;
                    console.log('[STATUS] Job blobUrl:', blobUrl);
                    if (!blobUrl) continue;

                    const fileName = generateFileName(userId || 'anonymous', 'image');
                    const permanentUrl = await downloadAndUploadToB2(env, blobUrl, fileName, 'image/png');

                    let generationId = null;
                    if (userId && env.SUPABASE_SERVICE_KEY) {
                        try {
                            generationId = await saveGeneration(env.SUPABASE_SERVICE_KEY, {
                                user_id: userId,
                                media_url: permanentUrl,
                                media_type: 'image',
                                prompt: prompt,
                                model_id: modelId,
                                batch_id: batchId,
                                settings: settings,
                            });
                        } catch (dbError: any) {
                            console.error('Supabase save failed (non-fatal):', dbError.message);
                        }
                    }

                    completedResults.push({ mediaUrl: permanentUrl, generationId });
                }
            }

            // Deduct credits AFTER all CivitAI results are uploaded
            if (creditCost && userId && env.SUPABASE_SERVICE_KEY) {
                await deductCreditsOnSuccess(env.SUPABASE_SERVICE_KEY, userId, creditCost.type, creditCost.cost);
            }

            return new Response(JSON.stringify({
                status: 'completed',
                results: completedResults,
                batchId: batchId,
                provider: 'civitai',
            }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ error: "Invalid provider. Use 'atlas' or 'civitai'" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Status check error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

