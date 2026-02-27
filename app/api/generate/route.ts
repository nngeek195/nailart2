import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { handImage, templateRef } = await req.json();

        // 🎯 Target the 2026 stable identifier
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const templateResp = await fetch(templateRef);
        if (!templateResp.ok) throw new Error(`Template Fetch Failed: ${templateResp.statusText}`);

        const templateBuf = await templateResp.arrayBuffer();
        const templateBase64 = Buffer.from(templateBuf).toString('base64');

        const prompt = "Overlay design to nails. Return ONLY base64.";

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: handImage.split(',')[1], mimeType: "image/jpeg" } },
            { inlineData: { data: templateBase64, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const text = response.text();
        const base64Clean = text.replace(/[^A-Za-z0-9+/=]/g, "");

        return NextResponse.json({ output: `data:image/png;base64,${base64Clean}` });

    } catch (error: any) {
        // 🧪 DETAILED ERROR PROPAGATION
        console.error("RIFT DIAGNOSTIC:", error);

        // Extract the raw message from Google or the System
        const errorMessage = error.message || "Unknown Rift";
        const statusCode = error.status || 500;

        return NextResponse.json({
            error: "Manifestation Interrupted",
            details: errorMessage,
            code: statusCode
        }, { status: statusCode });
    }
}