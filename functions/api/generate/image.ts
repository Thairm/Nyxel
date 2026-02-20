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
        if (modelId === 1) { // Nano Banana Pro
            const apiKey = env.ATLAS_CLOUD_API_KEY;
            if (!apiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            // TODO: Replace with exact Atlas Cloud endpoint and payload structure
            const response = await fetch("https://api.atlascloud.ai/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "nano-banana-pro", // Example model name
                    prompt: prompt,
                    ...params
                })
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // CivitAI Image Models
        if (modelId === 6 || modelId === 7) { // Z Image, WAINSFWIllustrious
            const apiKey = env.CIVITAI_API_TOKEN;
            if (!apiKey) throw new Error("Missing CIVITAI_API_TOKEN");

            // CivitAI URN based on model_integration_plan
            // WAINSFWIllustrious id is 827184, version 1183765
            // Z Image Base id is 2342797, version 2635223
            let civitaiModel = modelId === 6
                ? "urn:air:sdxl:checkpoint:civitai:2342797@2635223" // Z Image Base
                : "urn:air:sdxl:checkpoint:civitai:827184@2514310"; // WAINSFWIllustrious

            // Map frontend selectedRatio (e.g., '1:1', '2:3') to SDXL resolutions
            let width = 832;
            let height = 1216;
            if (params.ratio === '1:1') { width = 1024; height = 1024; }
            else if (params.ratio === '3:2') { width = 1216; height = 832; }
            else if (params.ratio === '9:16') { width = 768; height = 1344; }
            else if (params.ratio === '16:9') { width = 1344; height = 768; }

            const civitaiPayload = {
                $type: "textToImage",
                model: civitaiModel,
                params: {
                    prompt: prompt,
                    negativePrompt: params.negativePrompt || "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, mutated hands and fingers:1.4), (deformed, distorted, disfigured:1.3)",
                    scheduler: "EulerA", // Corresponds to Scheduler.EULER_A
                    steps: 25,
                    cfgScale: 7,
                    width: width,
                    height: height,
                    clipSkip: 2
                }
            };

            const response = await fetch("https://civitai.com/api/v1/consumer/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(civitaiPayload)
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "Unsupported model" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
