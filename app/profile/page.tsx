"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, doc, updateDoc } from "firebase/firestore";
import { Grid3X3, Bookmark, Settings, Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";

export default function ProfilePage() {
    const { appUser, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<'gens' | 'saved'>('gens');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");

    // Highlights & Status States
    const [highlights, setHighlights] = useState<any[]>([]);
    const [activeStatus, setActiveStatus] = useState<any | null>(null);
    const [progress, setProgress] = useState(0);

    // Fetch Highlights (Weekly Top + Personalized)
    useEffect(() => {
        if (!appUser) return;
        setNewName(appUser.username);

        const loadProfileData = async () => {
            // Simulated fetch for Top 10 Weekly & Personal Categories
            // In a real app, you'd perform the Firestore queries here
            const dummyHighlights = [
                { id: 'trending', label: "Weekly Top", image: "https://picsum.photos/seed/trend/200" },
                { id: 'cat1', label: "Chrome", image: "https://picsum.photos/seed/chrome/200" },
                { id: 'cat2', label: "Summer", image: "https://picsum.photos/seed/summer/200" },
            ];
            setHighlights(dummyHighlights);
        };
        loadProfileData();
    }, [appUser]);

    // Status Timer Logic (30 Seconds)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (activeStatus) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setActiveStatus(null);
                        return 100;
                    }
                    return prev + (100 / (30 * 10)); // 30 seconds at 100ms intervals
                });
            }, 100);
        }
        return () => clearInterval(timer);
    }, [activeStatus]);

    const handleUpdateProfile = async () => {
        if (!appUser?.uid) return;
        await updateDoc(doc(db, "users", appUser.uid), { username: newName });
        setIsEditing(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto pt-10 px-4 pb-32">

            {/* 1. HEADER & EDIT LOGIC */}
            <div className="flex items-center gap-10 mb-12">
                <div className="relative group shrink-0">
                    <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081] shadow-2xl">
                        <img src={appUser?.photoURL} className="w-full h-full rounded-full border-4 border-white object-cover" />
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none focus:ring-2 ring-purple-100" />
                                <button onClick={handleUpdateProfile} className="bg-purple-600 text-white px-4 py-1 rounded-lg text-sm font-bold">Save</button>
                                <button onClick={() => setIsEditing(false)} className="bg-gray-100 px-4 py-1 rounded-lg text-sm font-bold">Cancel</button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{appUser?.username}</h2>
                                <button onClick={() => setIsEditing(true)} className="px-5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest transition">Edit Profile</button>
                                <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:rotate-90 transition-transform duration-500" />
                            </>
                        )}
                    </div>
                    <div className="flex gap-10 text-slate-600">
                        <div className="text-center md:text-left">
                            <span className="block font-black text-slate-900 text-xl tracking-tighter">42</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generations</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="block font-black text-slate-900 text-xl tracking-tighter">15</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Templates</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. DYNAMIC HIGHLIGHTS (Spheres) */}
            <div className="flex gap-8 mb-16 overflow-x-auto pb-4 no-scrollbar">
                {highlights.map((h) => (
                    <button key={h.id} onClick={() => setActiveStatus(h)} className="flex flex-col items-center gap-3 shrink-0 group">
                        <div className="w-20 h-20 rounded-full border-2 border-slate-200 p-1 group-hover:border-purple-500 transition-all duration-500">
                            <div className="w-full h-full rounded-full overflow-hidden grayscale-[0.5] group-hover:grayscale-0 transition-all">
                                <img src={h.image} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-purple-600 transition-colors">{h.label}</span>
                    </button>
                ))}
            </div>

            {/* 3. TABS & CONTENT */}
            <div className="border-t border-slate-100">
                <div className="flex justify-center gap-16 -mt-px mb-8">
                    <button
                        onClick={() => setActiveTab('gens')}
                        className={`flex items-center gap-2 py-4 border-t-2 transition-all ${activeTab === 'gens' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}
                    >
                        <Grid3X3 className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Generations</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-2 py-4 border-t-2 transition-all ${activeTab === 'saved' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}
                    >
                        <Bookmark className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Saved</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-50 rounded-2xl overflow-hidden group relative cursor-pointer border border-slate-100">
                            <img src={`https://picsum.photos/seed/gen${i}/600/600`} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase shadow-xl tracking-widest">Open Result</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🎥 STATUS VIEWER MODAL (Instagram Style) */}
            {activeStatus && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative w-full max-w-[450px] aspect-[9/16] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">

                        {/* Progress Bar */}
                        <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-50">
                            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        {/* Top Info */}
                        <div className="absolute top-10 left-6 flex items-center gap-3 z-50 text-white">
                            <img src={activeStatus.image} className="w-8 h-8 rounded-full border border-white/50" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">{activeStatus.label}</p>
                                <p className="text-[10px] opacity-60">Trending Now</p>
                            </div>
                        </div>

                        <button onClick={() => setActiveStatus(null)} className="absolute top-10 right-6 text-white z-50 hover:rotate-90 transition-transform"><X /></button>

                        {/* Main Image View */}
                        <img src={activeStatus.image} className="w-full h-full object-cover" />

                        <div className="absolute bottom-10 left-6 right-6 p-6 bg-gradient-to-t from-black/80 to-transparent text-white rounded-[2rem]">
                            <h4 className="text-xl font-black mb-2 tracking-tight">Style Preview</h4>
                            <p className="text-xs opacity-70 leading-relaxed font-medium">Auto-generated from the most hearted patterns of the week in {activeStatus.label}.</p>
                            <button className="w-full mt-6 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Try On Template</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}