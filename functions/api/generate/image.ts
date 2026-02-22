import { getCivitaiClient, getCivitaiModelUrn, isCivitaiModel, Scheduler } from '../../lib/civitai-client';
import { downloadAndUploadToB2 } from '../../lib/b2-client';
import { saveGeneration } from '../../lib/supabase-server';

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
        '9:16': { width: 768, height: 1344 },
        '16:9': { width: 1344, height: 768 },
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

export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { modelId, prompt, params, userId, quantity } = body;

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Prompt is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
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
                    resolution: "1k",
                    enable_sync_mode: true,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || errorData.message || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();

            // Sync mode: image is ready — upload to B2 and save to Supabase
            const tempUrl = extractAtlasImageUrl(data);
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
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
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
                    size: ratioToWanSize(params?.ratio || params?.aspect_ratio || "1:1"),
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
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
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
                        });
                    } catch (dbError: any) {
                        console.error('Supabase save failed (non-fatal):', dbError.message);
                    }
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
                return new Response(JSON.stringify({
                    status: 'processing',
                    token: generationResult.token,
                    provider: 'civitai',
                    model: modelId,
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
