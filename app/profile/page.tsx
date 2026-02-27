"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import {
    collection, query, where, getDocs, limit,
    orderBy, doc, updateDoc, onSnapshot, Timestamp
} from "firebase/firestore";
import { Grid3X3, Bookmark, Settings, X, Loader2, Sparkles, TrendingUp } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";

export default function ProfilePage() {
    const { appUser, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<'gens' | 'saved'>('gens');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const qGens = query(
        collection(db, "generations"),
        where("userId", "==", appUser.uid), // Field 1: Equality
        orderBy("createdAt", "desc")        // Field 2: Sort
    );

    // Data States
    const [myGenerations, setMyGenerations] = useState<any[]>([]);
    const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
    const [highlights, setHighlights] = useState<any[]>([]);

    // Status/Story States
    const [activeStatus, setActiveStatus] = useState<any | null>(null);
    const [statusItems, setStatusItems] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);

    // 1. SYNC REAL-TIME STATS & CONTENT
    useEffect(() => {
        if (!appUser?.uid) return;
        setNewName(appUser.username);

        // Sync User Generations
        const qGens = query(collection(db, "generations"), where("userId", "==", appUser.uid), orderBy("createdAt", "desc"));
        const unsubGens = onSnapshot(qGens, (snap) => {
            const gens = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMyGenerations(gens);
            generatePersonalSpheres(gens); // Logic 2: Personalized Spheres
        });

        // Sync Saved Styles
        const unsubUser = onSnapshot(doc(db, "users", appUser.uid), async (userDoc) => {
            const savedIds = userDoc.data()?.savedStyles || [];
            if (savedIds.length > 0) {
                const qSaved = query(collection(db, "templates"), where("__name__", "in", savedIds));
                const snap = await getDocs(qSaved);
                setSavedTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                setSavedTemplates([]);
            }
        });

        fetchTrendingHighlight(); // Logic 1: Weekly Trending

        return () => { unsubGens(); unsubUser(); };
    }, [appUser]);

    // LOGIC 1: Weekly Trending (Templates from last 7 days)
    // LOGIC 1: Weekly Trending
    const fetchTrendingHighlight = async () => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const q = query(
            collection(db, "templates"),
            where("status", "==", "approved"),
            where("createdAt", ">=", Timestamp.fromDate(lastWeek)),
            limit(10)
        );
        const snap = await getDocs(q);
        const trendingDocs = snap.docs.map(d => d.data());

        if (trendingDocs.length > 0) {
            setHighlights(prev => {
                // 🛑 CHECK: If 'trending' already exists, don't add it again
                const exists = prev.find(h => h.id === 'trending');
                if (exists) return prev;

                return [{
                    id: 'trending', // This is the key causing the error
                    label: "Weekly Top",
                    icon: <TrendingUp className="w-5 h-5" />,
                    items: trendingDocs,
                    image: trendingDocs[0].marketplaceImage
                }, ...prev];
            });
        }
    };

    // LOGIC 2: Personalized Spheres (Based on User's most used tags)
    const generatePersonalSpheres = (gens: any[]) => {
        const tagCounts: Record<string, number> = {};
        gens.forEach(g => {
            if (g.tags) g.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1);
        });

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag);

        // Here you would fetch templates matching these top tags to populate the 'Personal' spheres
    };

    // 🎥 STATUS TIMER (30 Seconds)
    useEffect(() => {
        let timer: any;
        if (activeStatus) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) { setActiveStatus(null); return 0; }
                    return p + 0.33; // Approx 30s
                });
            }, 100);
        }
        return () => clearInterval(timer);
    }, [activeStatus]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto pt-10 px-4 pb-32">

            {/* 1. HEADER SECTION */}
            <header className="flex items-center gap-10 mb-12">
                <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081] shadow-2xl">
                    <img src={appUser?.photoURL} className="w-full h-full rounded-full border-4 border-white object-cover shadow-inner" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="p-2 border rounded-xl outline-none ring-2 ring-purple-100" />
                                <button onClick={() => { updateDoc(doc(db, "users", appUser.uid), { username: newName }); setIsEditing(false); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black">SAVE</button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-slate-800 italic">{appUser?.username}</h2>
                                <button onClick={() => setIsEditing(true)} className="px-5 py-1.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Settings</button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-10 text-slate-400">
                        <div><span className="block text-xl font-black text-slate-900 tracking-tighter">{myGenerations.length}</span><span className="text-[10px] font-bold uppercase tracking-widest">Generations</span></div>
                        <div><span className="block text-xl font-black text-slate-900 tracking-tighter">{savedTemplates.length}</span><span className="text-[10px] font-bold uppercase tracking-widest">Saved</span></div>
                    </div>
                </div>
            </header>

            {/* 2. DYNAMIC HIGHLIGHTS (The Spheres) */}
            <div className="flex gap-8 mb-16 overflow-x-auto pb-4 no-scrollbar">
                {highlights.map((h) => (
                    <button key={h.id} onClick={() => setActiveStatus(h)} className="flex flex-col items-center gap-3 shrink-0 group">
                        <div className="w-20 h-20 rounded-full border-2 border-slate-100 p-1 group-hover:border-purple-600 transition-all duration-500">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                {h.image ? <img src={h.image} className="w-full h-full object-cover" /> : h.icon}
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">{h.label}</span>
                    </button>
                ))}
            </div>

            {/* 3. TABS & GRID */}
            <div className="border-t border-slate-100">
                <div className="flex justify-center gap-16 -mt-px mb-8">
                    <button onClick={() => setActiveTab('gens')} className={`flex items-center gap-2 py-4 border-t-2 transition-all ${activeTab === 'gens' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}>
                        <Grid3X3 className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Generations</span>
                    </button>
                    <button onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 py-4 border-t-2 transition-all ${activeTab === 'saved' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}>
                        <Bookmark className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Saved Styles</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'gens' ? (
                        myGenerations.map(gen => (
                            <div key={gen.id} className="aspect-square bg-slate-50 rounded-2xl overflow-hidden group relative cursor-pointer border border-slate-100 shadow-sm">
                                <img src={gen.resultImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                    <div className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase shadow-2xl tracking-widest">Result Details</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        savedTemplates.map(t => <TemplateCard key={t.id} template={t} />)
                    )}
                </div>
            </div>

            {/* 🎬 STATUS VIEWER (God-Like Control) */}
            {activeStatus && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                    <div className="relative w-full max-w-[420px] aspect-[9/16] bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        {/* Progress Header */}
                        <div className="absolute top-8 left-8 right-8 flex gap-1 z-50">
                            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <div className="absolute top-14 left-8 flex items-center gap-3 z-50 text-white">
                            <div className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-md">
                                {activeStatus.icon || <Sparkles className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">{activeStatus.label}</p>
                                <p className="text-[10px] opacity-60">Curated multiverse patterns</p>
                            </div>
                        </div>

                        <button onClick={() => setActiveStatus(null)} className="absolute top-14 right-8 text-white z-50 bg-black/20 p-2 rounded-full backdrop-blur-md hover:rotate-90 transition-transform"><X /></button>

                        <img src={activeStatus.image} className="w-full h-full object-cover" />

                        <div className="absolute bottom-12 left-8 right-8 p-8 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 text-white">
                            <h4 className="text-2xl font-black mb-2 italic tracking-tighter">Style Preview</h4>
                            <p className="text-[10px] opacity-70 leading-relaxed font-bold uppercase tracking-wider">Generated from the most heartbeat patterns in {activeStatus.label} this week.</p>
                            <button className="w-full mt-6 py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-purple-600 hover:text-white transition-all">Try On Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}