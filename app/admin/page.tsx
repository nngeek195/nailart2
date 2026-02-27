"use client";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
    collection, query, where, onSnapshot, doc,
    updateDoc, deleteDoc, addDoc, serverTimestamp,
    writeBatch, Timestamp
} from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Loader2, ShieldCheck, Zap, Users, Layers,
    Trash2, Tag, PlusCircle, Sparkles, Activity,
    ShieldAlert, CheckCircle2, Globe, Search,
    Cpu, AlertTriangle, RefreshCw
} from "lucide-react";

export default function SupremeAdminConsole() {
    const { appUser, loading } = useAuth();
    const router = useRouter();

    // --- DATA STATES ---
    const [pending, setPending] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allTemplates, setAllTemplates] = useState<any[]>([]);
    const [mainTags, setMainTags] = useState<any[]>([]);
    const [discoveredTags, setDiscoveredTags] = useState<string[]>([]);
    const [dailyGens, setDailyGens] = useState<number>(0);

    // --- HEALTH CHECK STATE ---
    const [healthStatus, setHealthStatus] = useState<'checking' | 'active' | 'zeroed' | 'error'>('checking');
    const [healthMsg, setHealthMsg] = useState("Initializing rift diagnostics...");

    // --- UI STATES ---
    const [view, setView] = useState<'status' | 'queue' | 'spheres' | 'users' | 'inventory'>('status');
    const [tagName, setTagName] = useState("");
    const [tagBg, setTagBg] = useState("");
    const [userSearch, setUserSearch] = useState("");

    // 🛡️ Divine Guard: Ensures only Niranga (Admin) can enter
    useEffect(() => {
        if (!loading && (!appUser || appUser.role !== 'admin')) {
            router.push("/");
        }
    }, [appUser, loading, router]);

    // 📡 Universal Data Synchronization
    useEffect(() => {
        if (appUser?.role !== 'admin') return;

        const dayAgo = new Date();
        dayAgo.setHours(dayAgo.getHours() - 24);

        // 1. Quota Monitor
        const unsubQuota = onSnapshot(query(collection(db, "generations"), where("createdAt", ">=", dayAgo)), (snap) => setDailyGens(snap.size));

        // 2. Asset Synchronization Logic
        const unsubTemplates = onSnapshot(collection(db, "templates"), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllTemplates(docs);

            // Logic Upgrade: Separate Queue and Inventory in real-time
            setPending(docs.filter((t: any) => t.status === "pending"));
            setInventory(docs.filter((t: any) => t.status === "approved"));

            const mainNames = new Set(mainTags.map(t => t.name.toLowerCase()));
            const newTags = new Set<string>();
            docs.forEach((t: any) => {
                t.tags?.forEach((tag: string) => { if (!mainNames.has(tag.toLowerCase())) newTags.add(tag); });
            });
            setDiscoveredTags(Array.from(newTags));
        });

        // 3. User & Sphere Hierarchy
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubTags = onSnapshot(query(collection(db, "tags"), where("isMain", "==", true)), (snap) => setMainTags(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        runHealthCheck();

        return () => { unsubQuota(); unsubTemplates(); unsubUsers(); unsubTags(); };
    }, [appUser, mainTags.length]);

    // 🩺 API Health Diagnostic Logic (Upgraded for Reliability)
    const runHealthCheck = async () => {
        setHealthStatus('checking');
        try {
            const res = await fetch("/api/admin/health-check");
            if (!res.ok) {
                if (res.status === 429) throw new Error("QUOTA_ZEROED");
                throw new Error("COMM_FAIL");
            }
            setHealthStatus('active');
            setHealthMsg("Rift is stable. API Core is fully manifest.");
        } catch (e: any) {
            setHealthStatus(e.message === "QUOTA_ZEROED" ? 'zeroed' : 'error');
            setHealthMsg(e.message === "QUOTA_ZEROED" ? "Billing Required or Quota Hit." : "Server communication failure.");
        }
    };

    // ⚡ Command Center Functions (Upgraded for multi-view support)
    const manageTemplate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        const ref = doc(db, "templates", id);
        if (action === 'delete') {
            if (confirm("Permanently erase from multiverse?")) await deleteDoc(ref);
        } else {
            await updateDoc(ref, { status: action === 'approve' ? "approved" : "rejected" });
        }
    };

    const establishSphere = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagName || !tagBg) return;
        await addDoc(collection(db, "tags"), { name: tagName, bgImage: tagBg, isMain: true, createdAt: serverTimestamp() });
        setTagName(""); setTagBg("");
    };

    if (loading || appUser?.role !== 'admin') return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-purple-600" /></div>;

    const quotaPercentage = Math.min((dailyGens / 1500) * 100, 100);

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-slate-900 pb-20 font-sans">
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><ShieldCheck className="w-6 h-6" /></div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter italic leading-none uppercase">Supreme Console</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Master {appUser.username}</p>
                        </div>
                    </div>
                    <nav className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] gap-1">
                        {['status', 'queue', 'inventory', 'spheres', 'users'].map((tab: any) => (
                            <button key={tab} onClick={() => setView(tab as any)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === tab ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>{tab}</button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 mt-12">
                {/* --- VIEW: SYSTEM STATUS --- */}
                {view === 'status' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-10">
                                    <h2 className="text-4xl font-black tracking-tighter italic">Gemini <span className="text-red-600">Quota</span></h2>
                                    <div className="bg-slate-50 px-6 py-3 rounded-2xl text-right">
                                        <p className="text-3xl font-black leading-none">{dailyGens}<span className="text-sm text-slate-300">/ 1500</span></p>
                                    </div>
                                </div>
                                <div className="h-5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div className={`h-full transition-all duration-1000 ${quotaPercentage > 85 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`} style={{ width: `${quotaPercentage}%` }} />
                                </div>
                            </div>

                            <div className={`p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl transition-all ${healthStatus === 'active' ? 'bg-slate-900' : healthStatus === 'zeroed' ? 'bg-orange-600' : 'bg-red-600'}`}>
                                <Cpu className="w-10 h-10" />
                                <div>
                                    <h4 className="text-xl font-black italic uppercase tracking-tight">API Health</h4>
                                    <p className="text-xs text-white/60 font-medium leading-relaxed mt-2">{healthMsg}</p>
                                    <button onClick={runHealthCheck} className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit hover:bg-white/20 transition">
                                        <RefreshCw className={`w-3 h-3 ${healthStatus === 'checking' && 'animate-spin'}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Re-Diagnose</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Inventory", val: inventory.length, icon: Layers, color: "text-blue-600 bg-blue-50" },
                                { label: "Pending", val: pending.length, icon: Zap, color: "text-orange-600 bg-orange-50" },
                                { label: "Mortals", val: allUsers.length, icon: Users, color: "text-purple-600 bg-purple-50" },
                                { label: "Trends", val: discoveredTags.length, icon: Sparkles, color: "text-pink-600 bg-pink-50" }
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className={`${s.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-5`}><s.icon className="w-5 h-5" /></div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- VIEW: QUEUE (Upgraded for Judgment) --- */}
                {view === 'queue' && (
                    <div className="space-y-6 animate-in fade-in">
                        {pending.map(t => (
                            <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex gap-8 items-center shadow-sm">
                                <img src={t.marketplaceImage} className="w-24 h-32 object-cover rounded-2xl border bg-slate-50" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black italic tracking-tighter">{t.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">By {t.editorName}</p>
                                    <div className="flex gap-4 mt-6">
                                        <button onClick={() => manageTemplate(t.id, 'approve')} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Approve</button>
                                        <button onClick={() => manageTemplate(t.id, 'reject')} className="px-8 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pending.length === 0 && <div className="p-32 text-center text-slate-300 font-black italic">The Queue is at peace.</div>}
                    </div>
                )}

                {/* --- VIEW: INVENTORY (Upgraded for Vault Management) --- */}
                {view === 'inventory' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 animate-in fade-in">
                        {inventory.map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm group relative">
                                <div className="aspect-[3/4] overflow-hidden rounded-2xl mb-4">
                                    <img src={t.marketplaceImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                </div>
                                <h4 className="text-xs font-black truncate italic">{t.title}</h4>
                                <button onClick={() => manageTemplate(t.id, 'delete')} className="absolute top-6 right-6 p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {inventory.length === 0 && <div className="col-span-full p-32 text-center text-slate-300 font-black italic">The Vault is empty.</div>}
                    </div>
                )}

                {/* VIEW: SPHERES --- */}
                {view === 'spheres' && (
                    <div className="space-y-12 animate-in fade-in">
                        <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-black mb-10 flex items-center gap-3 tracking-tighter uppercase italic"><PlusCircle className="text-purple-600" /> Establish Manual Sphere</h2>
                            <form onSubmit={establishSphere} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input value={tagName} onChange={e => setTagName(e.target.value)} placeholder="Sphere Name" className="p-5 bg-slate-50 rounded-2xl outline-none" />
                                <input value={tagBg} onChange={e => setTagBg(e.target.value)} placeholder="Background URL" className="p-5 bg-slate-50 rounded-2xl outline-none" />
                                <button type="submit" className="bg-slate-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">Manifest</button>
                            </form>
                        </section>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            {mainTags.map(tag => (
                                <div key={tag.id} className="relative aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl group">
                                    <img src={tag.bgImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-100 transition-all group-hover:bg-red-500/80 cursor-pointer" onClick={() => deleteDoc(doc(db, "tags", tag.id))}>
                                        <span className="text-white font-black uppercase text-[8px] tracking-[0.2em] group-hover:hidden">{tag.name}</span>
                                        <Trash2 className="text-white hidden group-hover:block w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW: USERS --- */}
                {view === 'users' && (
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-10">Identity</th><th className="p-10">Rank</th><th className="p-10 text-right">Command</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {allUsers.map(u => (
                                    <tr key={u.id}>
                                        <td className="p-10"><p className="font-black text-lg">{u.username}</p><p className="text-xs text-slate-400">{u.email}</p></td>
                                        <td className="p-10"><span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{u.role || 'user'}</span></td>
                                        <td className="p-10 text-right space-x-6">
                                            <button onClick={() => updateDoc(doc(db, "users", u.id), { role: 'editor' })} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">Promote</button>
                                            <button onClick={() => updateDoc(doc(db, "users", u.id), { role: 'user' })} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:underline">Revoke</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}