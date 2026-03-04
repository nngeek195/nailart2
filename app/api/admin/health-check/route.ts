import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    const results = {
        gemini: { status: "checking", message: "" },
        huggingface: { status: "checking", message: "" },
    };

    // 1. Check Gemini 3.1
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-preview" });
        // Minimal call to verify key and model status
        await model.generateContent("ping"); 
        results.gemini = { status: "online", message: "Gemini 3.1 is stable." };
    } catch (e: any) {
        results.gemini = { status: "offline", message: e.message };
    }

    // 2. Check Hugging Face (Manual Fetch for Type Safety)
    try {
        const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
                method: "GET",
            }
        );

        if (hfResponse.status === 200) {
            results.huggingface = { status: "online", message: "Flux.1 is active." };
        } else if (hfResponse.status === 503) {
            results.huggingface = { status: "loading", message: "Flux is warming up (503)." };
        } else {
            const errData = await hfResponse.json();
            results.huggingface = { status: "offline", message: errData.error || "Unknown Error" };
        }
    } catch (e: any) {
        results.huggingface = { status: "offline", message: e.message };
    }

    return NextResponse.json(results);
}