import { getCivitaiClient, getCivitaiModelUrn, isCivitaiModel, Scheduler } from '../../lib/civitai-client';

// Helper: Map frontend aspect ratio to Wan 2.6 size format
function ratioToWanSize(ratio: string): string {
    const sizeMap: Record<string, string> = {
        '1:1': '1280*1280',
        '16:9': '1920*1080',
        '9:16': '1080*1920',
        '4:3': '1200*800', // closest available
        '3:4': '800*1200',
        '3:2': '1280*960', // closest available
        '2:3': '960*1280',
    };
    return sizeMap[ratio] || '1280*1280';
}

export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { modelId, prompt, params } = body;

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Prompt is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Atlas Cloud Image Models
        const atlasCloudApiKey = env.ATLAS_CLOUD_API_KEY;

        // ============================================
        // Nano Banana Pro (ID: 1)
        // Docs: https://www.atlascloud.ai/models/google/nano-banana-pro/text-to-image?tab=api
        // Params: model, prompt, aspect_ratio, resolution(1k/2k/4k), enable_sync_mode, enable_base64_output
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
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // Wan 2.6 Text-to-Image (ID: 15)
        // Docs: https://www.atlascloud.ai/models/alibaba/wan-2.6/text-to-image?tab=api
        // Params: model, prompt, size(pixel format), negative_prompt, enable_prompt_expansion,
        //         enable_sync_mode, enable_base64_output, seed
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
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // Wan 2.6 Image Edit (ID: 16)
        // Docs: https://www.atlascloud.ai/models/alibaba/wan-2.6/image-edit?tab=api
        // Params: model, prompt, images(array!), size, negative_prompt,
        //         enable_prompt_expansion, enable_sync_mode, enable_base64_output, seed
        // ============================================
        if (modelId === 16) {
            if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            if (!params?.image && !params?.images) {
                return new Response(JSON.stringify({ error: "Image is required for Image Edit mode" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // API requires 'images' as array, not 'image' as string
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
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================================
        // CivitAI Image Models (IDs: 6, 7, 9, 10, 11, 12, 13, 14)
        // Uses Civitai SDK: civitai.image.fromText()
        // Requires Yellow Buzz for NSFW models
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
                const generationResult = await civitai.image.fromText({
                    model: modelUrn,
                    params: {
                        prompt: prompt,
                        negativePrompt: params?.negativePrompt || "",
                        scheduler: params?.scheduler || Scheduler.EULER_A,
                        steps: params?.steps || 30,
                        cfgScale: params?.cfgScale || 7,
                        width: params?.width || 512,
                        height: params?.height || 512,
                        seed: params?.seed || -1,
                        clipSkip: params?.clipSkip || 2,
                    }
                });

                return new Response(JSON.stringify({
                    success: true,
                    model: modelId,
                    generation: generationResult
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (civitaiError: any) {
                // Better error messaging for common Civitai errors
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
