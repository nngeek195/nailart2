"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { Heart } from "lucide-react";

export default function SaveHeart({ templateId }: { templateId: string }) {
    const { appUser } = useAuth();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!appUser?.uid) return;
        // Listen to the user's document for real-time heart updates
        const unsub = onSnapshot(doc(db, "users", appUser.uid), (userDoc) => {
            if (userDoc.exists()) {
                const saved = userDoc.data().savedStyles || [];
                setIsSaved(saved.includes(templateId));
            }
        });
        return () => unsub();
    }, [appUser, templateId]);

    const toggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // ✋ CRITICAL: Stops the GeneratorModal from opening

        if (!appUser?.uid) return alert("Please log in to save styles.");

        const userRef = doc(db, "users", appUser.uid);
        try {
            if (isSaved) {
                await updateDoc(userRef, { savedStyles: arrayRemove(templateId) });
            } else {
                await updateDoc(userRef, { savedStyles: arrayUnion(templateId) });
            }
        } catch (error) {
            console.error("Heart Error:", error);
        }
    };

    return (
        <button
            onClick={toggleSave}
            className={`p-2.5 rounded-full transition-all duration-300 shadow-lg backdrop-blur-md 
                ${isSaved
                    ? "bg-pink-500 text-white scale-110"
                    : "bg-white/80 text-gray-400 hover:text-pink-500 hover:scale-110"}`}
        >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
    );
}