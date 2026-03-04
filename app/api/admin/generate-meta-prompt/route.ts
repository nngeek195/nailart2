import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json();

        // 🎯 THE 2026 ADMIN MODEL (Stable & High Performance)
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-preview" });

        const prompt = `
            Analyze this nail art template. Generate a professional 'Meta-Prompt' for a diffusion model.
            Include: color hex codes, nail shape (almond, square), texture (matte, gloss), 
            and specific patterns. Format as a single descriptive paragraph.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64.split(',')[1], mimeType: "image/jpeg" } }
        ]);

        return NextResponse.json({ metaPrompt: result.response.text() });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}