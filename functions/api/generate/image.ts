import { getCivitaiClient, getCivitaiModelUrn, isCivitaiModel, Scheduler } from '../../lib/civitai-client';
import { downloadAndUploadToB2 } from '../../lib/b2-client';
import { saveGeneration, getSupabaseServer } from '../../lib/supabase-server';
import { getImageCost, canUseFreeCreation } from '../../lib/credit-costs';

// Helper: Map frontend aspect ratio to Wan 2.6 size format
function ratioToWanSize(ratio: string): string {
    const sizeMap: Record<string, string> = {
        '1:1': '1280*1280',
        '16:9': '1920*1080',
        '9:16': '1080*1920',
        '4:3': '1200*800',
        '3:4': '800*1200',
        '3:2': '1280*960',
        '2:3': '960*1280',
        '4:5': '1024*1280',
        '5:4': '1280*1024',
        '21:9': '1680*720',
    };
    return sizeMap[ratio] || '1280*1280';
}

// Helper: Map frontend aspect ratio to SDXL pixel dimensions
function ratioToSDXLDimensions(ratio: string): { width: number; height: number } {
    const dimensionMap: Record<string, { width: number; height: number }> = {
        '1:1': { width: 1024, height: 1024 },
        '2:3': { width: 832, height: 1216 },
        '3:2': { width: 1216, height: 832 },
        '3:4': { width: 896, height: 1152 },
        '4:3': { width: 1152, height: 896 },
        '4:5': { width: 960, height: 1200 },
        '5:4': { width: 1200, height: 960 },
        '9:16': { width: 768, height: 1344 },
        '16:9': { width: 1344, height: 768 },
        '21:9': { width: 1536, height: 640 },
    };
    return dimensionMap[ratio] || { width: 1024, height: 1024 };
}

/**
 * Generate a unique filename for B2 storage.
 */
function generateFileName(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `generations/${userId}/${timestamp}_${random}.png`;
}

/**
 * Extract image URL(s) from an Atlas Cloud sync response.
 * Atlas Cloud returns images in various fields depending on the model.
 */
function extractAtlasImageUrl(data: any): string | null {
    // Try common response fields
    if (data.data?.outputs?.[0]) return data.data.outputs[0];  // Nano Banana Pro format
    if (data.output?.url) return data.output.url;
    if (data.output?.image_url) return data.output.image_url;
    if (data.output?.images?.[0]?.url) return data.output.images[0].url;
    if (data.images?.[0]?.url) return data.images[0].url;
    if (data.image_url) return data.image_url;
    if (data.url) return data.url;
    // Some models return base64 — not a URL, handled separately
    if (data.output?.image) return null; // base64 case
    return null;
}

/**
 * Check if a user has enough credits (does NOT deduct).
 */
async function checkCredits(
    serviceKey: string,
    userId: string,
    creditType: 'gems' | 'crystals',
    amount: number
): Promise<{ sufficient: boolean; current: number; error?: string }> {
    const supabase = getSupabaseServer(serviceKey);
    const column = creditType;

    const { data: credits } = await supabase
        .from('user_credits')
        .select('gems, crystals')
        .eq('user_id', userId)
        .single();

    if (!credits) {
        return { sufficient: false, current: 0, error: 'No credit record found. Please subscribe or wait for free credits.' };
    }

    const current = credits[column];
    if (current < amount) {
        return { sufficient: false, current, error: `Insufficient ${creditType}. Need ${amount} but have ${current}.` };
    }

    return { sufficient: true, current };
}

/**
 * Actually deduct credits after a successful generation.
 */
async function deductCreditsAfterSuccess(
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

    console.log(`[CREDITS] Deducted ${amount} ${creditType} from user ${userId}. Was: ${credits[column]}, Now: ${Math.max(0, credits[column] - amount)}`);
}

export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { modelId, prompt, params, userId, quantity, freeCreation } = body;

        // Auth guard — require a signed-in user
        if (!userId) {
            return new Response(JSON.stringify({ error: "Authentication required. Please sign in to generate images." }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Prompt is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // Credit Check ONLY (no deduction yet — deduct after success)
        // Free Creation bypasses crystal cost for Pro/Ultra on eligible illustrious models.
        // ============================================

        // Models eligible for Free Creation (not Atlas Cloud, not Z Image Base)
        const FREE_GENERATION_MODEL_IDS = new Set([7, 9, 10, 11, 12, 13, 14]);

        let creditCost: { type: 'gems' | 'crystals'; cost: number } | null = null;
        if (env.SUPABASE_SERVICE_KEY) {
            // Free Creation guard: Pro/Ultra only, eligible illustrious models only
            let skipCreditCheck = false;
            if (freeCreation && isCivitaiModel(modelId) && FREE_GENERATION_MODEL_IDS.has(modelId)) {
                const supabase = getSupabaseServer(env.SUPABASE_SERVICE_KEY);
                const { data: sub } = await supabase
                    .from('user_subscriptions')
                    .select('current_tier, status')
                    .eq('user_id', userId)
                    .single();
                const userTier = (sub?.status === 'active') ? sub.current_tier : null;

                if (!canUseFreeCreation(userTier)) {
                    return new Response(JSON.stringify({
                        error: 'Free Creation is a Pro or Ultra feature. Please upgrade your plan.',
                    }), {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
                skipCreditCheck = true;
                console.log(`[FREE CREATION] Pro/Ultra user ${userId} — skipping crystal cost`);
            }

            if (!skipCreditCheck) {
                // Nano Banana Pro: resolution-based cost (150 gems for 1k/2k, 300 for 4k)
                const costInfo = modelId === 1
                    ? { type: 'gems' as const, cost: (params?.resolution || '1k') === '4k' ? 300 : 150 }
                    : getImageCost(modelId);

                if (costInfo) {
                    const totalCost = isCivitaiModel(modelId)
                        ? costInfo.cost * Math.min(quantity || 1, 4)
                        : costInfo.cost;
                    creditCost = { type: costInfo.type, cost: totalCost };

                    const check = await checkCredits(
                        env.SUPABASE_SERVICE_KEY,
                        userId,
                        costInfo.type,
                        totalCost
                    );

                    if (!check.sufficient) {
                        return new Response(JSON.stringify({
                            error: check.error,
                            creditType: costInfo.type,
                            required: totalCost,
                            remaining: check.current,
                        }), {
                            status: 402,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    console.log(`[CREDITS] Check passed: ${totalCost} ${costInfo.type} needed, user has ${check.current}`);
                }
            }
        }

        // Atlas Cloud Image Models
        const atlasCloudApiKey = env.ATLAS_CLOUD_API_KEY;

        // ============================================
        // Nano Banana Pro (ID: 1) — SYNC mode
        // ============================================
        if (modelId === 1) {
            if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            const response = await fetch("https://api.atlascloud.ai/api/v1/model/generateImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${atlasCloudApiKey}`
                },
                body: JSON.stringify({
                    model: "google/nano-banana-pro/text-to-image",
                    prompt: prompt,
                    aspect_ratio: params?.ratio || params?.aspect_ratio || "1:1",
                    resolution: params?.resolution || "1k",
                    enable_sync_mode: true,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || errorData.message || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('[ATLAS] Nano Banana Pro response:', JSON.stringify(data).substring(0, 1000));

            // Sync mode: image is ready — upload to B2 and save to Supabase
            const tempUrl = extractAtlasImageUrl(data);
            console.log('[ATLAS] Extracted URL:', tempUrl ? tempUrl.substring(0, 200) : 'NULL — URL extraction failed!');
            if (tempUrl) {
                const fileName = generateFileName(userId || 'anonymous');
                const permanentUrl = await downloadAndUploadToB2(env, tempUrl, fileName, 'image/png');

                // Save to Supabase
                let generationId = null;
                if (userId && env.SUPABASE_SERVICE_KEY) {
                    try {
                        generationId = await saveGeneration(env.SUPABASE_SERVICE_KEY, {
                            user_id: userId,
                            media_url: permanentUrl,
                            media_type: 'image',
                            prompt: prompt,
                            model_id: modelId,
                            batch_id: crypto.randomUUID(),
                            settings: params || {},
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
                }

                // Deduct credits AFTER successful generation
                if (creditCost && userId && env.SUPABASE_SERVICE_KEY) {
                    await deductCreditsAfterSuccess(env.SUPABASE_SERVICE_KEY, userId, creditCost.type, creditCost.cost);
                }

                return new Response(JSON.stringify({
                    status: 'completed',
                    mediaUrl: permanentUrl,
                    generationId,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // If we couldn't extract URL (e.g. base64), check for async job ID
            if (data.id) {
                return new Response(JSON.stringify({
                    status: 'processing',
                    jobId: data.id,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Fallback: return raw data
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // Wan 2.6 Text-to-Image (ID: 15) — SYNC mode
        // ============================================
        if (modelId === 15) {
            if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            const response = await fetch("https://api.atlascloud.ai/api/v1/model/generateImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${atlasCloudApiKey}`
                },
                body: JSON.stringify({
                    model: "alibaba/wan-2.6/text-to-image",
                    prompt: prompt,
                    size: params?.size || '1280*720',
                    negative_prompt: params?.negativePrompt || undefined,
                    seed: params?.seed ?? -1,
                    enable_sync_mode: true,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || errorData.message || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();

            // Sync mode: upload to B2
            const tempUrl = extractAtlasImageUrl(data);
            if (tempUrl) {
                const fileName = generateFileName(userId || 'anonymous');
                const permanentUrl = await downloadAndUploadToB2(env, tempUrl, fileName, 'image/png');

                let generationId = null;
                if (userId && env.SUPABASE_SERVICE_KEY) {
                    try {
                        generationId = await saveGeneration(env.SUPABASE_SERVICE_KEY, {
                            user_id: userId,
                            media_url: permanentUrl,
                            media_type: 'image',
                            prompt: prompt,
                            model_id: modelId,
                            batch_id: crypto.randomUUID(),
                            settings: params || {},
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
                }

                // Deduct credits AFTER successful generation
                if (creditCost && userId && env.SUPABASE_SERVICE_KEY) {
                    await deductCreditsAfterSuccess(env.SUPABASE_SERVICE_KEY, userId, creditCost.type, creditCost.cost);
                }

                return new Response(JSON.stringify({
                    status: 'completed',
                    mediaUrl: permanentUrl,
                    generationId,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (data.id) {
                return new Response(JSON.stringify({
                    status: 'processing',
                    jobId: data.id,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // Wan 2.6 Image Edit (ID: 16) — SYNC mode
        // ============================================
        if (modelId === 16) {
            if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            if (!params?.image && !params?.images) {
                return new Response(JSON.stringify({ error: "Image is required for Image Edit mode" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const images = params?.images || (params?.image ? [params.image] : []);

            const response = await fetch("https://api.atlascloud.ai/api/v1/model/generateImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${atlasCloudApiKey}`
                },
                body: JSON.stringify({
                    model: "alibaba/wan-2.6/image-edit",
                    prompt: prompt,
                    images: images,
                    size: ratioToWanSize(params?.ratio || params?.aspect_ratio || "1:1"),
                    negative_prompt: params?.negativePrompt || undefined,
                    seed: params?.seed ?? 0,
                    enable_sync_mode: true,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || errorData.message || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();

            const tempUrl = extractAtlasImageUrl(data);
            if (tempUrl) {
                const fileName = generateFileName(userId || 'anonymous');
                const permanentUrl = await downloadAndUploadToB2(env, tempUrl, fileName, 'image/png');

                let generationId = null;
                if (userId && env.SUPABASE_SERVICE_KEY) {
                    try {
                        generationId = await saveGeneration(env.SUPABASE_SERVICE_KEY, {
                            user_id: userId,
                            media_url: permanentUrl,
                            media_type: 'image',
                            prompt: prompt,
                            model_id: modelId,
                            batch_id: crypto.randomUUID(),
                            settings: params || {},
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
                }

                // Deduct credits AFTER successful generation
                if (creditCost && userId && env.SUPABASE_SERVICE_KEY) {
                    await deductCreditsAfterSuccess(env.SUPABASE_SERVICE_KEY, userId, creditCost.type, creditCost.cost);
                }

                return new Response(JSON.stringify({
                    status: 'completed',
                    mediaUrl: permanentUrl,
                    generationId,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (data.id) {
                return new Response(JSON.stringify({
                    status: 'processing',
                    jobId: data.id,
                    provider: 'atlas',
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // CivitAI Image Models (IDs: 6, 7, 9, 10, 11, 12, 13, 14)
        // ASYNC — returns token for polling
        // ============================================
        if (isCivitaiModel(modelId)) {
            const apiToken = env.CIVITAI_API_TOKEN;
            if (!apiToken) throw new Error("Missing CIVITAI_API_TOKEN");

            const modelUrn = getCivitaiModelUrn(modelId);
            if (!modelUrn) {
                return new Response(JSON.stringify({ error: "Invalid Civitai model ID" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const civitai = getCivitaiClient(apiToken);

            try {
                // Resolve aspect ratio to SDXL pixel dimensions
                const ratio = params?.ratio || params?.aspect_ratio || '1:1';
                const dimensions = ratioToSDXLDimensions(ratio);
                const imageQuantity = Math.min(Math.max(quantity || 1, 1), 4); // 1-4 images

                console.log('[CIVITAI] Generating', imageQuantity, 'images at', dimensions.width, 'x', dimensions.height, 'ratio:', ratio);

                // Don't wait (pass false/omit second arg) — get the token for polling
                const generationResult = await civitai.image.fromText({
                    model: modelUrn,
                    params: {
                        prompt: prompt,
                        negativePrompt: params?.negativePrompt || "",
                        scheduler: params?.scheduler || Scheduler.EULER_A,
                        steps: params?.steps || 30,
                        cfgScale: params?.cfgScale || 7,
                        width: dimensions.width,
                        height: dimensions.height,
                        seed: params?.seed || -1,
                        clipSkip: params?.clipSkip || 2,
                    },
                    quantity: imageQuantity,
                });

                // CivitAI returns { token, jobs: [...] }
                // Pass credit cost info so status.ts can deduct after completion
                return new Response(JSON.stringify({
                    status: 'processing',
                    token: generationResult.token,
                    provider: 'civitai',
                    model: modelId,
                    creditCost: creditCost,  // Pass to frontend → status.ts for deduction after success
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (civitaiError: any) {
                const errorMessage = civitaiError.message || String(civitaiError);
                if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
                    throw new Error(
                        "Civitai Forbidden: This model requires Yellow Buzz (paid). " +
                        "Blue Buzz only supports SFW content. Please ensure you have " +
                        "sufficient Yellow Buzz in your Civitai account."
                    );
                }
                throw civitaiError;
            }
        }

        return new Response(JSON.stringify({ error: "Unsupported model" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Image generation error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
