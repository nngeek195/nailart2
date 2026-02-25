import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadUserImage } from "@/services/storage";
import { generateNailArt } from "@/services/gemini";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const userId = formData.get("userId") as string;
        const templateId = formData.get("templateId") as string;
        const handImageFile = formData.get("handImage") as File;

        if (!userId || !templateId || !handImageFile) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Get User Info (for Token/Quota)
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const userData = userDoc.data();

        // 2. Get Template Info (Cloudinary URL)
        const templateDoc = await getDoc(doc(db, "templates", templateId));
        if (!templateDoc.exists()) return NextResponse.json({ error: "Template not found" }, { status: 404 });
        const templateData = templateDoc.data();
        const templateRefUrl = templateData.referenceImage; // The high-contrast AI ref

        // 3. Upload User Hand to Google Cloud Storage (The Private Vault)
        const handImageUrl = await uploadUserImage(handImageFile, userId, "hand");

        // 4. Call Gemini API (The Creative Engine)
        // We pass the user's token if implementing strict user-pays, 
        // otherwise we use server key but track usage.
        const base64Result = await generateNailArt(
            userData.refreshToken || "server-key",
            templateRefUrl,
            handImageUrl
        );

        // 5. Convert Base64 Result to File and Save to GCS
        const resultBlob = await (await fetch(base64Result)).blob();
        const resultFile = new File([resultBlob], "result.png", { type: "image/png" });
        const finalResultUrl = await uploadUserImage(resultFile, userId, "result");

        // 6. Save Record to Firestore (Generations Collection)
        await addDoc(collection(db, "generations"), {
            userId,
            templateId,
            handImageUrl,
            generatedImageUrl: finalResultUrl,
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true, imageUrl: finalResultUrl });

    } catch (error) {
        console.error("Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}