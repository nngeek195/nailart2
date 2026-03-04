import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { handImage, metaPrompt } = await req.json();

        // 🎯 THE 2026 PRODUCTION URL (Crucial: Added /models/)
        const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0";
        const ROUTER_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

        const response = await fetch(ROUTER_URL, {
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                // Ensure inputs and prompt are direct siblings
                inputs: handImage.includes('base64,') ? handImage.split(',')[1] : handImage,
                prompt: `Hyper-realistic fingernails, nail art: ${metaPrompt}, 8k photo`,
                parameters: {
                    negative_prompt: "deformed fingers, extra limbs, blurry",
                    strength: 0.35,
                    guidance_scale: 7.5,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Router Rift (${response.status}): ${errorText}`);
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        return NextResponse.json({ output: `data:image/png;base64,${base64}` });

    } catch (error: any) {
        console.error("ROUTER RIFT:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}