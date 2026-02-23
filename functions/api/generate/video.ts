// Video generation API with Atlas Cloud integration
// Supports 15 video model variants across 5 base models
// API params verified against official Atlas Cloud documentation

// Helper: Map frontend aspect ratio to pixel size for Wan 2.6 T2V
function ratioToWanVideoSize(ratio: string): string {
    const sizeMap: Record<string, string> = {
        '16:9': '1920*1080',
        '9:16': '1080*1920',
        '1:1': '960*960',
        '4:3': '1088*832',
        '3:4': '832*1088',
    };
    return sizeMap[ratio] || '1280*720';
}

// Helper: Map frontend aspect ratio to Sora 2 size format
function ratioToSoraSize(ratio: string): string {
    if (ratio === '9:16' || ratio === '2:3' || ratio === '3:4') return '720*1280';
    return '1280*720'; // landscape/square default
}

export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { modelId, variantId, prompt, params } = body;

        if (!prompt && !variantId?.includes('i2v') && !variantId?.includes('ref')) {
            return new Response(JSON.stringify({ error: "Prompt is required for text-to-video" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const atlasCloudApiKey = env.ATLAS_CLOUD_API_KEY;
        if (!atlasCloudApiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

        // Model + variant to API model name mapping
        const videoModelMap: Record<number, { baseName: string; variants: Record<string, string> }> = {
            2: {
                baseName: "openai/sora-2",
                variants: {
                    "t2v": "openai/sora-2/text-to-video-pro-developer",
                    "i2v": "openai/sora-2/image-to-video-pro-developer"
                }
            },
            3: {
                baseName: "google/veo3.1",
                variants: {
                    "t2v": "google/veo3.1/text-to-video",
                    "ref2v": "google/veo3.1/reference-to-video",
                    "i2v": "google/veo3.1/image-to-video",
                    "fast-i2v": "google/veo3.1-fast/image-to-video"
                }
            },
            4: {
                baseName: "alibaba/wan-2.6",
                variants: {
                    "t2v": "alibaba/wan-2.6/text-to-video",
                    "i2v": "alibaba/wan-2.6/image-to-video",
                    "flash-i2v": "alibaba/wan-2.6/image-to-video-flash"
                }
            },
            5: {
                baseName: "alibaba/wan-2.2",
                variants: {
                    "t2v": "alibaba/wan-2.2/t2v-5b-720p-lora",
                    "i2v": "alibaba/wan-2.2/i2v-5b-720p-lora"
                }
            },
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

        const modelConfig = videoModelMap[modelId];
        if (!modelConfig) {
            return new Response(JSON.stringify({ error: "Unsupported video model" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const selectedVariant = variantId || Object.keys(modelConfig.variants)[0];
        const apiModelName = modelConfig.variants[selectedVariant];

        if (!apiModelName) {
            return new Response(JSON.stringify({ error: `Invalid variant: ${selectedVariant}` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Build request body — each model has DIFFERENT params
        let requestBody: any = { model: apiModelName };

        if (prompt) {
            requestBody.prompt = prompt;
        }

        // ============================================
        // SORA 2 (ID: 2) — t2v and i2v
        // Params: model, prompt, duration(10/15/25), size("1280*720"/"720*1280")
        // I2V additionally: image (required)
        // ============================================
        if (modelId === 2) {
            const validDurations = [10, 15, 25];
            requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 10;
            requestBody.size = ratioToSoraSize(params?.ratio || params?.aspect_ratio || "16:9");

            if (selectedVariant === 'i2v') {
                if (!params?.image) {
                    return new Response(JSON.stringify({ error: "Image is required for Sora 2 I2V" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.image = params.image;
            }
        }

        // ============================================
        // VEO 3.1 (ID: 3) — t2v, ref2v, i2v, fast-i2v
        // T2V: model, prompt, aspect_ratio, duration(4/6/8), resolution(720p/1080p),
        //      generate_audio, negative_prompt, seed
        // Ref2V: + images(array 1-3), no aspect_ratio or duration
        // I2V/Fast-I2V: + image, last_image, aspect_ratio, duration
        // ============================================
        if (modelId === 3) {
            if (selectedVariant === 't2v') {
                requestBody.aspect_ratio = params?.aspect_ratio || "16:9";
                const validDurations = [4, 6, 8];
                requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 4;
                requestBody.resolution = params?.resolution === "720p" ? "720p" : "1080p";
                requestBody.generate_audio = params?.generate_audio ?? false;
                if (params?.negative_prompt || params?.negativePrompt) {
                    requestBody.negative_prompt = params.negative_prompt || params.negativePrompt;
                }
                if (params?.seed !== undefined) requestBody.seed = params.seed;
            }

            if (selectedVariant === 'ref2v') {
                if (!params?.images && !params?.image) {
                    return new Response(JSON.stringify({ error: "Images required for Veo 3.1 Reference-to-Video (1-3 images)" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.images = params.images || [params.image];
                requestBody.resolution = params?.resolution === "720p" ? "720p" : "1080p";
                requestBody.generate_audio = params?.generate_audio ?? false;
                if (params?.negative_prompt || params?.negativePrompt) {
                    requestBody.negative_prompt = params.negative_prompt || params.negativePrompt;
                }
                if (params?.seed !== undefined) requestBody.seed = params.seed;
            }

            if (selectedVariant === 'i2v' || selectedVariant === 'fast-i2v') {
                if (!params?.image) {
                    return new Response(JSON.stringify({ error: "Image required for Veo 3.1 Image-to-Video" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.image = params.image;
                requestBody.aspect_ratio = params?.aspect_ratio || "16:9";
                const validDurations = [4, 6, 8];
                requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 4;
                requestBody.resolution = params?.resolution === "720p" ? "720p" : "1080p";
                requestBody.generate_audio = params?.generate_audio ?? false;
                if (params?.negative_prompt || params?.negativePrompt) {
                    requestBody.negative_prompt = params.negative_prompt || params.negativePrompt;
                }
                if (params?.last_image) requestBody.last_image = params.last_image;
                if (params?.seed !== undefined) requestBody.seed = params.seed;
            }
        }

        // ============================================
        // WAN 2.6 VIDEO (ID: 4) — t2v, i2v, flash-i2v
        // T2V: model, prompt, size(pixel format!), duration(5/10/15),
        //      negative_prompt, enable_prompt_expansion, shot_type, generate_audio, audio, seed
        // I2V/Flash: model, prompt, image, resolution(720p/1080p), duration(5/10/15),
        //            negative_prompt, enable_prompt_expansion, shot_type, generate_audio, audio, seed
        // ============================================
        if (modelId === 4) {
            if (selectedVariant === 't2v') {
                requestBody.size = ratioToWanVideoSize(params?.ratio || params?.aspect_ratio || "16:9");
                const validDurations = [5, 10, 15];
                requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 5;
                requestBody.generate_audio = params?.generate_audio ?? true;
                requestBody.enable_prompt_expansion = params?.enable_prompt_expansion ?? true;
                requestBody.shot_type = params?.shot_type || "multi";
                if (params?.negative_prompt || params?.negativePrompt) {
                    requestBody.negative_prompt = params.negative_prompt || params.negativePrompt;
                }
                if (params?.seed !== undefined) requestBody.seed = params.seed;
            }

            if (selectedVariant === 'i2v' || selectedVariant === 'flash-i2v') {
                if (!params?.image) {
                    return new Response(JSON.stringify({ error: "Image required for Wan 2.6 Image-to-Video" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.image = params.image;
                requestBody.resolution = params?.resolution === "1080p" ? "1080p" : "720p";
                const validDurations = [5, 10, 15];
                requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 5;
                requestBody.generate_audio = params?.generate_audio ?? true;
                requestBody.enable_prompt_expansion = params?.enable_prompt_expansion ?? true;
                requestBody.shot_type = params?.shot_type || "multi";
                if (params?.negative_prompt || params?.negativePrompt) {
                    requestBody.negative_prompt = params.negative_prompt || params.negativePrompt;
                }
                if (params?.seed !== undefined) requestBody.seed = params.seed;
            }
        }

        // ============================================
        // WAN 2.2 (ID: 5) — t2v and i2v
        // T2V: model, prompt, size("1280*720"/"720*1280"), seed, loras
        // I2V: model, prompt, image, seed, loras
        // NOTE: NO duration, NO resolution, NO aspect_ratio params!
        // ============================================
        if (modelId === 5) {
            if (selectedVariant === 't2v') {
                const ratio = params?.ratio || params?.aspect_ratio || "16:9";
                requestBody.size = (ratio === '9:16' || ratio === '2:3' || ratio === '3:4')
                    ? '720*1280' : '1280*720';
                requestBody.seed = params?.seed ?? -1;
                requestBody.loras = params?.loras || [];
            }

            if (selectedVariant === 'i2v') {
                if (!params?.image) {
                    return new Response(JSON.stringify({ error: "Image required for Wan 2.2 I2V" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.image = params.image;
                requestBody.seed = params?.seed ?? -1;
                requestBody.loras = params?.loras || [];
            }
        }

        // ============================================
        // LTX-2 (ID: 8) — fast-t2v, fast-i2v, pro-t2v, pro-i2v
        // All: model, prompt, duration, generate_audio
        // I2V variants additionally: image
        // Fast duration: 6,8,10,12,14,16,18,20
        // Pro duration: 6,8,10 only
        // NOTE: NO resolution, NO audio URL param!
        // ============================================
        if (modelId === 8) {
            const isFast = selectedVariant.includes('fast');
            const validFastDurations = [6, 8, 10, 12, 14, 16, 18, 20];
            const validProDurations = [6, 8, 10];
            const validDurations = isFast ? validFastDurations : validProDurations;

            requestBody.duration = validDurations.includes(params?.duration) ? params.duration : 6;

            // Audio sync: only include if user uploaded an audio file (future feature)
            if (params?.audio) {
                requestBody.audio = params.audio;
            }

            if (selectedVariant.includes('i2v')) {
                if (!params?.image) {
                    return new Response(JSON.stringify({ error: "Image required for LTX-2 I2V" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                requestBody.image = params.image;
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
            throw new Error(errorData.error || errorData.message || `Atlas Cloud API error: ${response.status}`);
        }

        const data = await response.json() as any;

        // All video models are async — return job ID for frontend polling
        // The frontend will poll /api/generate/status?provider=atlas&jobId=xxx
        const jobId = data.id || data.job_id || data.request_id;

        if (jobId) {
            return new Response(JSON.stringify({
                status: 'processing',
                jobId: jobId,
                provider: 'atlas',
                model: modelId,
                variant: selectedVariant,
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Fallback: return raw data if no job ID found
        return new Response(JSON.stringify({
            status: 'unknown',
            model: modelId,
            variant: selectedVariant,
            apiModel: apiModelName,
            rawResponse: data,
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
