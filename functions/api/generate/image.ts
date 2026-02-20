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
            // Z Image Pro id is 2186208, version 2461607

            let baseModel = modelId === 6
                ? "urn:air:sdxl:checkpoint:civitai:2186208@2461607" // Z Image Pro
                : "urn:air:sdxl:checkpoint:civitai:827184@1183765"; // WAINSFWIllustrious

            const response = await fetch("https://civitai.com/api/v1/images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    baseModel,
                    prompt,
                    ...params
                })
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
