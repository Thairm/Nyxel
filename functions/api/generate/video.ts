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

        // Atlas Cloud Video Models
        const videoModels = [2, 3, 4, 5, 8]; // Sora2, Veo3.1, Wan 2.6, Wan2.2, Ltx2

        if (videoModels.includes(modelId)) {
            const apiKey = env.ATLAS_CLOUD_API_KEY;
            if (!apiKey) throw new Error("Missing ATLAS_CLOUD_API_KEY");

            let apiModelName = "vidu-q3-text-to-video"; // Default fallback
            if (modelId === 2) apiModelName = "sora-2";
            if (modelId === 3) apiModelName = "veo-3.1";
            if (modelId === 4) apiModelName = "wan-2.6";
            // ... mapping others ...

            // TODO: Replace with exact Atlas Cloud video endpoint
            const response = await fetch("https://api.atlascloud.ai/v1/videos/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: apiModelName,
                    prompt: prompt,
                    ...params
                })
            });

            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "Unsupported video model" }), {
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
