"use client";
import { useState, useEffect } from "react"; // Added useEffect
import { useAuth } from "@/providers/AuthProvider";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Upload, Plus, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";

// UPDATED TYPE: Added all fields found in Firestore
type Template = {
    id: string;
    title: string;
    status: "pending" | "approved" | "rejected";
    adminComment?: string;
    createdAt: any;
    marketplaceImage: string; // <--- ADDED
    referenceImage?: string; // <--- ADDED
    tags?: string[]; // <--- ADDED
};

export default function EditorDashboard() {
    const { appUser } = useAuth();
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [beautyShot, setBeautyShot] = useState<File | null>(null);
    const [aiRef, setAiRef] = useState<File | null>(null);
    const [tags, setTags] = useState("");

    // 1. Fetch Editor's Templates (Real-time)
    useEffect(() => { // <--- CHANGED useState to useEffect
        if (!appUser) return;
        const q = query(collection(db, "templates"), where("createdBy", "==", appUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Template[];
            setTemplates(data);
        });
        return () => unsubscribe();
    }, [appUser]);

    // 2. Submit Template
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!beautyShot || !aiRef) return alert("Please upload both images.");
        setUploading(true);

        try {
            // MOCK UPLOAD: Replace with Cloudinary logic later
            const beautyUrl = "https://picsum.photos/seed/beauty/400/500";
            const aiRefUrl = "https://picsum.photos/seed/ai/400/500";

            await addDoc(collection(db, "templates"), {
                title,
                marketplaceImage: beautyUrl,
                referenceImage: aiRefUrl,
                tags: tags.split(",").map(t => t.trim()),
                status: "pending",
                editorName: appUser?.username,
                createdBy: appUser?.uid,
                createdAt: serverTimestamp(),
            });

            // Reset Form
            setTitle("");
            setTags("");
            setBeautyShot(null);
            setAiRef(null);
            alert("Template Submitted for Review!");
        } catch (err) {
            console.error(err);
            alert("Submission failed.");
        } finally {
            setUploading(false);
        }
    };

    if (!appUser || (appUser.role !== "editor" && appUser.role !== "admin")) {
        return <div className="p-10 text-center">Access Denied. Editors Only.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Creator Studio</h1>
                <p className="text-gray-500">Manage your marketplace submissions and track approvals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Upload Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="text-[#7D2AE8]" /> New Template
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Neon Summer" required />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Beauty Shot (Marketplace)</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setBeautyShot(e.target.files?.[0] || null)} accept="image/*" />
                                    {beautyShot ? beautyShot.name : "Click to Upload"}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">AI Reference (High Contrast)</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setAiRef(e.target.files?.[0] || null)} accept="image/*" />
                                    {aiRef ? aiRef.name : "Click to Upload"}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags (comma separated)</label>
                                <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Chrome, Blue, Summer" />
                            </div>

                            <button disabled={uploading} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 flex justify-center items-center gap-2">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Drafts & Pending */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">My Submissions</h3>

                    {templates.length === 0 && <p className="text-gray-400 text-sm">No submissions yet.</p>}

                    {templates.map(t => (
                        <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start">
                            {/* Thumbnail */}
                            <img src={t.marketplaceImage} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900">{t.title}</h4>
                                    <StatusBadge status={t.status} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Submitted: {t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </p>

                                {/* REJECTION FEEDBACK */}
                                {t.status === 'rejected' && t.adminComment && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start">
                                        <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-red-700 uppercase">Admin Feedback:</p>
                                            <p className="text-sm text-red-800 font-medium">{t.adminComment}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "approved") return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Live</span>;
    if (status === "rejected") return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Rejected</span>;
    return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
}