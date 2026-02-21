// Video generation API with Atlas Cloud integration
// Supports 15 video model variants across 5 base models

export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { modelId, variantId, prompt, params } = body;

        if (!prompt && !variantId?.includes('i2v') && !variantId?.includes('i2v') && !variantId?.includes('ref')) {
            return new Response(JSON.stringify({ error: "Prompt is required for text-to-video" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const atlasCloudApiKey = env.ATLAS_CLOUD_API_KEY;
        if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

        // Model ID to API model name mapping
        const videoModelMap: Record<number, { baseName: string; variants: Record<string, string> }> = {
            // Sora2 - 2 variants
            2: {
                baseName: "openai/sora-2",
                variants: {
                    "t2v": "openai/sora-2/text-to-video-pro-developer",
                    "i2v": "openai/sora-2/image-to-video-pro-developer"
                }
            },
            // Veo3.1 - 4 variants
            3: {
                baseName: "google/veo3.1",
                variants: {
                    "t2v": "google/veo3.1/text-to-video",
                    "ref2v": "google/veo3.1/reference-to-video",
                    "i2v": "google/veo3.1/image-to-video",
                    "fast-i2v": "google/veo3.1-fast/image-to-video"
                }
            },
            // Wan 2.6 Video - 3 variants
            4: {
                baseName: "alibaba/wan-2.6",
                variants: {
                    "t2v": "alibaba/wan-2.6/text-to-video",
                    "i2v": "alibaba/wan-2.6/image-to-video",
                    "flash-i2v": "alibaba/wan-2.6/image-to-video-flash"
                }
            },
            // Wan 2.2 - 2 variants
            5: {
                baseName: "alibaba/wan-2.2",
                variants: {
                    "t2v": "alibaba/wan-2.2/t2v-5b-720p-lora",
                    "i2v": "alibaba/wan-2.2/i2v-5b-720p-lora"
                }
            },
            // LTX-2 - 4 variants
            8: {
                baseName: "lightricks/ltx-2",
                variants: {
                    "fast-t2v": "lightricks/ltx-2-fast/text-to-video",
                    "fast-i2v": "lightricks/ltx-2-fast/image-to-video",
                    "pro-t2v": "lightricks/ltx-2-pro/text-to-video",
                    "pro-i2v": "lightricks/ltx-2-pro/image-to-video"
                }
            }
        };

        // Check if it's a supported video model
        const modelConfig = videoModelMap[modelId];
        if (!modelConfig) {
            return new Response(JSON.stringify({ error: "Unsupported video model" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Get the specific variant or use default
        const selectedVariant = variantId || Object.keys(modelConfig.variants)[0];
        const apiModelName = modelConfig.variants[selectedVariant];

        if (!apiModelName) {
            return new Response(JSON.stringify({ error: `Invalid variant: ${selectedVariant}` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Build request body based on variant type
        const requestBody: any = {
            model: apiModelName,
        };

        // Add prompt for all variants
        if (prompt) {
            requestBody.prompt = prompt;
        }

        // Add variant-specific parameters
        if (selectedVariant.includes('t2v')) {
            // Text-to-Video specific params
            requestBody.duration = params?.duration || 5;
            requestBody.resolution = params?.resolution || "720p";
            
            // Veo3.1 specific
            if (modelId === 3) {
                requestBody.aspect_ratio = params?.aspect_ratio || "16:9";
                requestBody.generate_audio = params?.generate_audio ?? true;
                if (params?.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
                if (params?.seed) requestBody.seed = params.seed;
            }
            
            // LTX specific duration limits
            if (modelId === 8) {
                if (selectedVariant.includes('fast')) {
                    requestBody.duration = Math.min(params?.duration || 5, 20); // Max 20s for fast
                } else {
                    requestBody.duration = [6, 8, 10].includes(params?.duration) ? params.duration : 6; // Pro only supports 6s/8s/10s
                }
                if (params?.audio) requestBody.audio = params.audio;
            }
            
            // Wan 2.6/2.2 specific
            if (modelId === 4 || modelId === 5) {
                requestBody.duration = Math.min(params?.duration || 5, 15); // Max 15s
                if (params?.aspect_ratio) requestBody.aspect_ratio = params.aspect_ratio;
            }
        }

        if (selectedVariant.includes('i2v') || selectedVariant.includes('ref2v')) {
            // Image-to-Video and Reference-to-Video require images
            if (!params?.image && !params?.images) {
                return new Response(JSON.stringify({ 
                    error: `${selectedVariant} requires an image input` 
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (selectedVariant === 'ref2v') {
                // Reference-to-Video uses multiple images (1-3)
                requestBody.images = params.images || [params.image];
            } else {
                // Image-to-Video uses single image
                requestBody.image = params.image;
            }

            // Veo3.1 I2V specific
            if (modelId === 3 && selectedVariant.includes('i2v')) {
                requestBody.aspect_ratio = params?.aspect_ratio || "16:9";
                requestBody.duration = params?.duration || 5;
                requestBody.generate_audio = params?.generate_audio ?? true;
                requestBody.resolution = params?.resolution || "720p";
                if (params?.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
                if (params?.last_image) requestBody.last_image = params.last_image;
                if (params?.seed) requestBody.seed = params.seed;
            }

            // Wan 2.6 I2V specific
            if (modelId === 4 && selectedVariant.includes('i2v')) {
                requestBody.duration = Math.min(params?.duration || 5, 15);
                requestBody.resolution = params?.resolution || "720p";
            }

            // LTX I2V specific
            if (modelId === 8 && selectedVariant.includes('i2v')) {
                if (selectedVariant.includes('fast')) {
                    requestBody.duration = Math.min(params?.duration || 5, 20);
                } else {
                    requestBody.duration = [6, 8, 10].includes(params?.duration) ? params.duration : 6;
                }
            }

            // Sora2 I2V specific - requires resolution match
            if (modelId === 2 && selectedVariant === 'i2v') {
                requestBody.resolution = params?.resolution || "720p";
                // Note: Input image must match output resolution (720x1280 or 1280x720)
            }
        }

        // Make API request to Atlas Cloud
        const response = await fetch("https://api.atlascloud.ai/api/v1/model/generateVideo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${atlasCloudApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(errorData.error || `Atlas Cloud API error: ${response.status}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify({
            success: true,
            model: modelId,
            variant: selectedVariant,
            apiModel: apiModelName,
            generation: data
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Video generation error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
