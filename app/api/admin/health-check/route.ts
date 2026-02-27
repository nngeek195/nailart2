import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);

        // 🛡️ THE FIX: Using 'gemini-2.0-flash' or 'gemini-2.5-flash'
        // 🎯 UPDATE THIS LINE:
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Non-generative check to verify the "Rift" is open
        await model.countTokens("ping");

        return NextResponse.json({ status: "active" });
    } catch (error: any) {
        console.error("Health Check Failure:", error.message);

        if (error.message.includes("404")) {
            return NextResponse.json({
                error: "Model path not found. Ensure SDK is updated to version 0.2.x+."
            }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}