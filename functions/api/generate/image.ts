import { getCivitaiClient, getCivitaiModelUrn, isCivitaiModel, Scheduler } from '../../lib/civitai-client';

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
        
        // Nano Banana Pro (ID: 1)
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
                    aspect_ratio: params?.aspect_ratio || "1:1",
                    output_format: params?.output_format || "png",
                    ...params
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Wan 2.6 Text-to-Image (ID: 15)
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
                    ...params
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Wan 2.6 Image Edit (ID: 16)
        if (modelId === 16) {
            if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");
            
            if (!params?.image) {
                return new Response(JSON.stringify({ error: "Image is required for Image Edit mode" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const response = await fetch("https://api.atlascloud.ai/api/v1/model/generateImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${atlasCloudApiKey}`
                },
                body: JSON.stringify({
                    model: "alibaba/wan-2.6/image-edit",
                    prompt: prompt,
                    image: params.image,
                    ...params
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.error || `Atlas Cloud API error: ${response.status}`);
            }

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // CivitAI Image Models (IDs: 6, 7, 9, 10, 11, 12, 13, 14)
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
            
            // Generate image using Civitai SDK
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
