"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import TemplateCard from "@/components/TemplateCard";
import { Heart, Loader2, Sparkles } from "lucide-react";

export default function SavedStylesPage() {
    const { appUser, loading } = useAuth();
    const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!appUser?.uid) {
            setFetching(false);
            return;
        }

        const unsubUser = onSnapshot(doc(db, "users", appUser.uid), async (userDoc) => {
            const savedIds = userDoc.data()?.savedStyles || [];

            if (savedIds.length === 0) {
                setSavedTemplates([]);
                setFetching(false);
                return;
            }

            // Firebase 'in' query is limited to 10-30 items depending on version
            const q = query(collection(db, "templates"), where("__name__", "in", savedIds));
            const querySnap = await getDocs(q);
            setSavedTemplates(querySnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setFetching(false);
        });

        return () => unsubUser();
    }, [appUser]);

    if (loading || (fetching && appUser)) {
        return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-purple-600 w-10 h-10" /></div>;
    }

    if (!appUser) {
        return (
            <div className="p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Heart className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Your Vault is Locked</h2>
                <p className="text-gray-400 mt-2">Log in to save and view your favorite nail styles.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-10 pb-32">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-pink-500 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curated Collection</span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">
                    Saved <span className="text-purple-600">Styles</span>
                </h1>
            </header>

            {savedTemplates.length === 0 ? (
                <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                    <Heart className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">Your vault is currently empty.</p>
                    <p className="text-slate-300 text-xs uppercase mt-2 font-black tracking-widest">Explore and heart designs to see them here</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {savedTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
                </div>
            )}
        </div>
    );
}