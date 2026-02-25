"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Loader2, ShieldCheck, Zap, Users, Layers, Activity,
    Trash2, Check, X, Search, UserPlus, BarChart3,
    MoreHorizontal, Filter, ArrowUpRight, TrendingUp
} from "lucide-react";

export default function SupremeAdminConsole() {
    const { appUser, loading } = useAuth();
    const router = useRouter();
    const [pending, setPending] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allTemplates, setAllTemplates] = useState<any[]>([]);
    const [view, setView] = useState<'queue' | 'users' | 'inventory'>('queue');
    const [searchTerm, setSearchTerm] = useState("");

    // 🛡️ Divine Guard: Ensure only Admins enter
    useEffect(() => {
        if (!loading && (!appUser || appUser.role !== 'admin')) {
            router.push("/");
        }
    }, [appUser, loading, router]);

    // 📡 Global Data Synchronization
    useEffect(() => {
        if (appUser?.role !== 'admin') return;

        const unsubTemplates = onSnapshot(collection(db, "templates"), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllTemplates(docs);
            setPending(docs.filter((t: any) => t.status === "pending"));
        });

        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubTemplates(); unsubUsers(); };
    }, [appUser]);

    // ⚡ Universal Command Functions
    const updateRole = async (userId: string, newRole: string) => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    };

    const manageTemplate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        const ref = doc(db, "templates", id);
        if (action === 'delete') {
            if (confirm("Permanently erase this asset?")) await deleteDoc(ref);
        } else {
            await updateDoc(ref, { status: action === 'approve' ? "approved" : "rejected" });
        }
    };

    if (loading || appUser?.role !== 'admin') {
        return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
            {/* --- DIVINE TOP NAV --- */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-600 p-2 rounded-xl text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-gray-900">Supreme Admin</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status: Optimal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm font-bold">{appUser.username}</p>
                            <p className="text-[10px] text-purple-600 font-black uppercase">Root Authority</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 mt-10">
                {/* --- ANALYTICS HUD --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Assets", val: allTemplates.length, icon: Layers, color: "bg-blue-50 text-blue-600" },
                        { label: "Pending Review", val: pending.length, icon: Zap, color: "bg-orange-50 text-orange-600" },
                        { label: "Total Mortals", val: allUsers.length, icon: Users, color: "bg-purple-50 text-purple-600" },
                        { label: "Live Patterns", val: allTemplates.filter(t => t.status === 'approved').length, icon: TrendingUp, color: "bg-green-50 text-green-600" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className={`${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stat.val}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* --- COMMAND TABS --- */}
                <div className="flex gap-4 mb-8">
                    {[
                        { id: 'queue', label: 'Judgment Queue', count: pending.length },
                        { id: 'users', label: 'User Hierarchy' },
                        { id: 'inventory', label: 'Global Inventory' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as any)}
                            className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${view === tab.id ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            {tab.label} {tab.count !== undefined && <span className="ml-2 opacity-50 text-xs">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* --- DYNAMIC VIEWPORT --- */}
                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                    {view === 'queue' && (
                        <div className="divide-y divide-gray-100">
                            {pending.length === 0 ? (
                                <div className="p-20 text-center text-gray-400 italic font-medium">No entities currently awaiting judgment.</div>
                            ) : (
                                pending.map(t => (
                                    <div key={t.id} className="p-8 flex gap-8 hover:bg-gray-50/50 transition">
                                        <div className="flex gap-3 shrink-0">
                                            <img src={t.marketplaceImage} className="w-24 h-32 object-cover rounded-2xl border bg-gray-50" />
                                            <img src={t.referenceImage} className="w-24 h-32 object-cover rounded-2xl border border-dashed border-purple-200 bg-purple-50" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">{t.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1 font-medium">Creator: <span className="text-purple-600 font-bold">{t.editorName}</span></p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => manageTemplate(t.id, 'approve')} className="px-6 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-purple-600 transition shadow-md shadow-gray-100">APPROVE</button>
                                                <button onClick={() => manageTemplate(t.id, 'reject')} className="px-6 py-2.5 bg-gray-100 text-gray-600 text-xs font-black rounded-xl hover:bg-red-50 hover:text-red-600 transition">REJECT</button>
                                                <button onClick={() => manageTemplate(t.id, 'delete')} className="p-2.5 text-gray-300 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {view === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <th className="p-6">Identity</th>
                                        <th className="p-6">Role</th>
                                        <th className="p-6">Contribution</th>
                                        <th className="p-6 text-right">Divine Command</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                            <td className="p-6">
                                                <p className="font-black text-gray-900">{u.username || "Anonymous"}</p>
                                                <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'editor' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {allTemplates.filter(t => t.createdBy === u.id).length} Designs
                                                </p>
                                            </td>
                                            <td className="p-6 text-right space-x-2">
                                                <button onClick={() => updateRole(u.id, 'editor')} className="text-[10px] font-black text-purple-600 hover:underline">PROMOTE</button>
                                                <button onClick={() => updateRole(u.id, 'user')} className="text-[10px] font-black text-gray-400 hover:underline">REVOKE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'inventory' && (
                        <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {allTemplates.map(t => (
                                <div key={t.id} className="group relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={t.marketplaceImage} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition" />
                                    <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 transition duration-300">
                                        <p className="text-[10px] font-black text-gray-900 mb-4 text-center">{t.title}</p>
                                        <button onClick={() => manageTemplate(t.id, 'delete')} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg">DELETE</button>
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