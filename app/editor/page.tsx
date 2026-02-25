"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Clock, CheckCircle, XCircle, Image as ImageIcon, Sparkles } from "lucide-react";

export default function EditorPage() {
    const { appUser, loading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [beautyUrl, setBeautyUrl] = useState("");
    const [aiRefUrl, setAiRefUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mySubmissions, setMySubmissions] = useState<any[]>([]);

    // 1. Protection: Only Admin or Editor can access
    useEffect(() => {
        if (!loading && (!appUser || (appUser.role !== 'editor' && appUser.role !== 'admin'))) {
            router.push("/");
        }
    }, [appUser, loading, router]);

    // 2. Fetch Submissions
    useEffect(() => {
        if (!appUser?.uid) return;
        const q = query(collection(db, "templates"), where("createdBy", "==", appUser.uid));
        return onSnapshot(q, (snapshot) => {
            setMySubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, [appUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety Guard: Prevent 'undefined' createdBy error
        if (!appUser?.uid) {
            alert("Session not ready. Please try again in a moment.");
            return;
        }

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
        return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 flex flex-col lg:flex-row gap-10">
            <form onSubmit={handleSubmit} className="w-full lg:w-1/3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Plus className="text-[#7D2AE8]" /> New Template</h2>
                <div className="space-y-4">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design Title" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100" required />
                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (Space, Chrome)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100" required />
                    <input value={beautyUrl} onChange={(e) => setBeautyUrl(e.target.value)} placeholder="Marketplace Image URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100" required />
                    <input value={aiRefUrl} onChange={(e) => setAiRefUrl(e.target.value)} placeholder="Gemini Reference URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-purple-100" required />
                    <button type="submit" disabled={isSubmitting || !appUser?.uid} className="w-full py-5 btn-gradient text-white font-bold rounded-2xl shadow-lg disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Design"}
                    </button>
                </div>
            </form>

            <div className="flex-1">
                <h2 className="text-2xl font-black italic mb-6">Studio Submissions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mySubmissions.map(s => (
                        <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex gap-4 items-center">
                            <img src={s.marketplaceImage} className="w-20 h-20 rounded-2xl object-cover" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate">{s.title}</h4>
                                <div className="mt-2">
                                    {s.status === "pending" && <span className="text-[10px] font-bold text-orange-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                                    {s.status === "approved" && <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>}
                                    {s.status === "rejected" && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}