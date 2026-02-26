"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react";

export default function EditorPage() {
    const { appUser, loading } = useAuth();
    const router = useRouter();

    // 1. STATE MANAGEMENT
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [beautyUrl, setBeautyUrl] = useState("");
    const [aiRefUrl, setAiRefUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mySubmissions, setMySubmissions] = useState<any[]>([]);

    // Tag Prediction States
    const [mainTags, setMainTags] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // 2. ROUTE PROTECTION
    useEffect(() => {
        if (!loading && (!appUser || (appUser.role !== 'editor' && appUser.role !== 'admin'))) {
            router.push("/");
        }
    }, [appUser, loading, router]);

    // 3. FETCH DATA (Submissions & Main Tags)
    useEffect(() => {
        if (!appUser?.uid) return;

        // Fetch user's own submissions
        const qSubmissions = query(collection(db, "templates"), where("createdBy", "==", appUser.uid));
        const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
            setMySubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch Main Tags for prediction
        const unsubTags = onSnapshot(collection(db, "tags"), (snap) => {
            setMainTags(snap.docs.map(d => d.data().name));
        });

        return () => { unsubSubmissions(); unsubTags(); };
    }, [appUser]);

    // 4. PREDICTION LOGIC
    const lastTag = tags.split(",").pop()?.trim().toLowerCase() || "";
    const filteredSuggestions = mainTags.filter(t =>
        t.toLowerCase().startsWith(lastTag) && lastTag.length > 0
    );

    const selectSuggestion = (suggestion: string) => {
        const parts = tags.split(",").map(p => p.trim());
        parts.pop(); // Remove the partial tag
        const newTags = [...parts, suggestion].join(", ");
        setTags(newTags + ", "); // Add trailing comma for next tag
        setShowSuggestions(false);
    };

    // 5. SUBMISSION HANDLER
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appUser?.uid) return alert("Session not ready.");

        setIsSubmitting(true);
        const tagArray = tags.split(",").map(t => t.trim()).filter(t => t !== "");

        try {
            await addDoc(collection(db, "templates"), {
                title: title.trim(),
                marketplaceImage: beautyUrl,
                referenceImage: aiRefUrl,
                tags: tagArray,
                status: "pending",
                editorName: appUser.username || "Anonymous",
                createdBy: appUser.uid,
                createdAt: serverTimestamp()
            });
            setTitle(""); setTags(""); setBeautyUrl(""); setAiRefUrl("");
            alert("Submitted for Admin review!");
        } catch (err) {
            console.error("Upload Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || (appUser?.role !== 'admin' && appUser?.role !== 'editor')) {
        return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 flex flex-col lg:flex-row gap-10">
            {/* --- UPLOAD FORM --- */}
            <form onSubmit={handleSubmit} className="w-full lg:w-1/3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Plus className="text-[#7D2AE8]" /> New Template
                </h2>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Design Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chrome Galaxy" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100 transition-all" required />
                    </div>

                    {/* TAG INPUT WITH PREDICTIONS */}
                    <div className="relative space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Tags (Comma Separated)</label>
                        <input
                            value={tags}
                            onChange={(e) => { setTags(e.target.value); setShowSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="Type for suggestions..."
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100 transition-all"
                            required
                        />

                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                                {filteredSuggestions.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left p-3 hover:bg-purple-50 rounded-xl text-sm font-bold text-gray-700 flex items-center justify-between group"
                                    >
                                        {s} <Sparkles className="w-4 h-4 text-purple-200 group-hover:text-purple-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Marketplace Image URL</label>
                        <input value={beautyUrl} onChange={(e) => setBeautyUrl(e.target.value)} placeholder="Beauty Shot URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100 transition-all" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Gemini Reference URL</label>
                        <input value={aiRefUrl} onChange={(e) => setAiRefUrl(e.target.value)} placeholder="Clean Pattern URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100 transition-all" required />
                    </div>

                    <button type="submit" disabled={isSubmitting || !appUser?.uid} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-lg hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Design"}
                    </button>
                </div>
            </form>

            {/* --- SUBMISSIONS LIST --- */}
            <div className="flex-1">
                <h2 className="text-2xl font-black italic mb-6">Studio Submissions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mySubmissions.map(s => (
                        <div key={s.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex gap-4 items-center group hover:border-purple-200 transition-all">
                            <img src={s.marketplaceImage} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate text-slate-800">{s.title}</h4>
                                <div className="mt-2">
                                    {s.status === "pending" && <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>}
                                    {s.status === "approved" && <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Approved</span>}
                                    {s.status === "rejected" && <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {mySubmissions.length === 0 && (
                        <div className="col-span-2 p-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-bold italic">
                            No submissions found in your vault.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}