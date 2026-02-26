"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection, query, where, onSnapshot, doc,
    updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs
} from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Loader2, ShieldCheck, Zap, Users, Layers,
    Trash2, Tag, PlusCircle, Sparkles, ArrowUpCircle,
    Edit3, Check, X, AlertCircle, Globe, LayoutGrid
} from "lucide-react";

export default function SupremeAdminConsole() {
    const { appUser, loading } = useAuth();
    const router = useRouter();

    // Data States
    const [pending, setPending] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allTemplates, setAllTemplates] = useState<any[]>([]);
    const [mainTags, setMainTags] = useState<any[]>([]);
    const [discoveredTags, setDiscoveredTags] = useState<string[]>([]);

    // UI & Form States
    const [view, setView] = useState<'queue' | 'users' | 'inventory' | 'spheres'>('queue');
    const [tagName, setTagName] = useState("");
    const [tagBg, setTagBg] = useState("");
    const [rejectionNote, setRejectionNote] = useState("");

    // 🛡️ Divine Guard
    useEffect(() => {
        if (!loading && (!appUser || appUser.role !== 'admin')) {
            router.push("/");
        }
    }, [appUser, loading, router]);

    // 📡 Universal Data Synchronization & Tag Discovery Logic
    useEffect(() => {
        if (appUser?.role !== 'admin') return;

        // 1. Sync Templates & Discover New Tags
        const unsubTemplates = onSnapshot(collection(db, "templates"), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllTemplates(docs);
            setPending(docs.filter((t: any) => t.status === "pending"));

            // Calculate Discovered Tags (Tags used by editors not yet made into Main Spheres)
            const mainNames = new Set(mainTags.map(t => t.name.toLowerCase()));
            const newTags = new Set<string>();
            docs.forEach((t: any) => {
                if (t.tags && Array.isArray(t.tags)) {
                    t.tags.forEach((tag: string) => {
                        if (!mainNames.has(tag.toLowerCase())) newTags.add(tag);
                    });
                }
            });
            setDiscoveredTags(Array.from(newTags));
        });

        // 2. Sync Users
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 3. Sync Main Spheres (Tags)
        const unsubTags = onSnapshot(query(collection(db, "tags"), where("isMain", "==", true)), (snap) => {
            setMainTags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubTemplates(); unsubUsers(); unsubTags(); };
    }, [appUser, mainTags.length]);

    // ⚡ DIVINE COMMAND FUNCTIONS
    const manageTemplate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        const ref = doc(db, "templates", id);
        if (action === 'delete') {
            if (confirm("Erase this entity from existence?")) await deleteDoc(ref);
        } else {
            if (action === 'reject' && !rejectionNote) return alert("State a reason for your judgment.");
            await updateDoc(ref, {
                status: action === 'approve' ? "approved" : "rejected",
                adminComment: action === 'reject' ? rejectionNote : ""
            });
            setRejectionNote("");
        }
    };

    const manageTag = async (action: 'create' | 'delete', name: string, bg?: string, id?: string) => {
        if (action === 'create') {
            await addDoc(collection(db, "tags"), {
                name: name.trim(),
                bgImage: bg || "https://images.unsplash.com/photo-1604654894610-df490998ea7e?auto=format&fit=crop&w=800",
                isMain: true,
                createdAt: serverTimestamp()
            });
            setTagName(""); setTagBg("");
        } else if (action === 'delete' && id) {
            if (confirm(`Destroy the "${name}" Sphere?`)) await deleteDoc(doc(db, "tags", id));
        }
    };

    const updateRole = async (uid: string, role: string) => {
        await updateDoc(doc(db, "users", uid), { role });
    };

    if (loading || appUser?.role !== 'admin') return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
            {/* --- TOP HUD --- */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-600 p-2.5 rounded-2xl text-white shadow-xl shadow-purple-100"><ShieldCheck className="w-6 h-6" /></div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Supreme Authority</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active: {appUser.username}</p>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        {[
                            { id: 'queue', icon: Zap, label: 'Queue' },
                            { id: 'spheres', icon: Tag, label: 'Spheres' },
                            { id: 'users', icon: Users, label: 'Users' },
                            { id: 'inventory', icon: LayoutGrid, label: 'Inventory' }
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${view === tab.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 mt-10">
                {/* --- ANALYTICS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Assets", val: allTemplates.length, icon: Layers, color: "text-blue-600 bg-blue-50" },
                        { label: "Pending", val: pending.length, icon: Zap, color: "text-orange-600 bg-orange-50" },
                        { label: "Mortals", val: allUsers.length, icon: Users, color: "text-purple-600 bg-purple-50" },
                        { label: "New Tags", val: discoveredTags.length, icon: Sparkles, color: "text-pink-600 bg-pink-50" }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className={`${s.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4`}><s.icon className="w-5 h-5" /></div>
                            <p className="text-3xl font-black">{s.val}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* --- VIEW: JUDGMENT QUEUE --- */}
                    {view === 'queue' && (
                        <div className="space-y-6">
                            {pending.map(t => (
                                <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8">
                                    <div className="flex gap-4 shrink-0">
                                        <div className="text-center">
                                            <span className="text-[9px] font-bold text-gray-400 block mb-2 uppercase">Market</span>
                                            <img src={t.marketplaceImage} className="w-28 h-40 object-cover rounded-2xl border" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[9px] font-bold text-purple-400 block mb-2 uppercase italic">AI Core</span>
                                            <img src={t.referenceImage} className="w-28 h-40 object-cover rounded-2xl border border-dashed border-purple-200" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight">{t.title}</h3>
                                            <p className="text-sm text-gray-400 font-medium">By: <span className="text-purple-600 font-bold">{t.editorName}</span></p>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                value={rejectionNote}
                                                onChange={e => setRejectionNote(e.target.value)}
                                                placeholder="Add rejection note..."
                                                className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent focus:border-red-100"
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={() => manageTemplate(t.id, 'approve')} className="flex-1 py-4 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-purple-600 transition tracking-widest">APPROVE</button>
                                                <button onClick={() => manageTemplate(t.id, 'reject')} className="flex-1 py-4 bg-gray-100 text-gray-500 text-[10px] font-black rounded-xl hover:bg-red-50 hover:text-red-600 transition tracking-widest">REJECT</button>
                                                <button onClick={() => manageTemplate(t.id, 'delete')} className="p-4 text-gray-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pending.length === 0 && <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400 italic font-bold">The multiverse is at peace. No pending designs.</div>}
                        </div>
                    )}

                    {/* --- VIEW: SPHERE ARCHITECT (TAGS) --- */}
                    {view === 'spheres' && (
                        <div className="space-y-12">
                            {/* 🔮 DISCOVERY: PROMOTE NEW TAGS */}
                            <section>
                                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Sparkles className="text-pink-500 w-5 h-5" /> Editor Suggestions</h2>
                                <div className="flex flex-wrap gap-3">
                                    {discoveredTags.map(tag => (
                                        <div key={tag} className="bg-white border border-gray-200 pl-5 pr-3 py-2 rounded-2xl flex items-center gap-4 group">
                                            <span className="font-bold text-gray-700">{tag}</span>
                                            <button
                                                onClick={() => {
                                                    const bg = prompt(`Enter BG Image URL for "${tag}":`);
                                                    if (bg) manageTag('create', tag, bg);
                                                }}
                                                className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 hover:text-white transition flex items-center gap-1"
                                            >
                                                <ArrowUpCircle className="w-3.5 h-3.5" /> Manifest
                                            </button>
                                        </div>
                                    ))}
                                    {discoveredTags.length === 0 && <p className="text-gray-400 italic text-sm">No new tags detected in current assets.</p>}
                                </div>
                            </section>

                            {/* 🛠️ MANUAL CREATION */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><PlusCircle className="text-purple-600" /> New Sphere</h2>
                                <form onSubmit={e => { e.preventDefault(); manageTag('create', tagName, tagBg); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input value={tagName} onChange={e => setTagName(e.target.value)} placeholder="Tag Name" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
                                    <input value={tagBg} onChange={e => setTagBg(e.target.value)} placeholder="BG Image URL" className="p-4 bg-gray-50 rounded-2xl outline-none" required />
                                    <button type="submit" className="bg-purple-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-gray-900 transition">Establish</button>
                                </form>
                            </section>

                            {/* 💠 ACTIVE SPHERES MANAGEMENT */}
                            <section>
                                <h2 className="text-xl font-black mb-6">Active Platform Spheres</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                                    {mainTags.map(tag => (
                                        <div key={tag.id} className="relative group aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                                            <img src={tag.bgImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                                <span className="text-white font-black uppercase text-[10px] mb-4">{tag.name}</span>
                                                <button onClick={() => manageTag('delete', tag.name, '', tag.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none group-hover:hidden">
                                                <span className="text-white font-black uppercase text-[10px] tracking-widest">{tag.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- VIEW: USER HIERARCHY --- */}
                    {view === 'users' && (
                        <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <th className="p-8">Identity</th>
                                        <th className="p-8">Current Rank</th>
                                        <th className="p-8">Contribution</th>
                                        <th className="p-8 text-right">Command</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                            <td className="p-8">
                                                <p className="font-black text-gray-900">{u.username}</p>
                                                <p className="text-xs text-gray-400 font-medium font-mono">{u.email}</p>
                                            </td>
                                            <td className="p-8">
                                                <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}>{u.role || 'user'}</span>
                                            </td>
                                            <td className="p-8 font-bold">{allTemplates.filter(t => t.createdBy === u.id).length} Submissions</td>
                                            <td className="p-8 text-right space-x-4">
                                                <button onClick={() => updateRole(u.id, 'editor')} className="text-[10px] font-black text-purple-600 hover:underline">PROMOTE</button>
                                                <button onClick={() => updateRole(u.id, 'user')} className="text-[10px] font-black text-gray-400 hover:underline">REVOKE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- VIEW: GLOBAL INVENTORY --- */}
                    {view === 'inventory' && (
                        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {allTemplates.map(t => (
                                <div key={t.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                                    <img src={t.marketplaceImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                    <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                        <p className="text-[10px] font-black text-gray-900 mb-4 text-center">{t.title}</p>
                                        <button onClick={() => manageTemplate(t.id, 'delete')} className="w-full py-2.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition">ERASE ASSET</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}