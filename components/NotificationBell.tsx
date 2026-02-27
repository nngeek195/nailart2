"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { Bell, Sparkles, Zap, X } from "lucide-react";
import Link from "next/link";

export default function NotificationBell() {
    const { appUser, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
    const [hasUnread, setHasUnread] = useState(true);

    // 📡 Fetch 10 most recent approved templates
    useEffect(() => {
        const q = query(
            collection(db, "templates"),
            where("status", "==", "approved"),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setRecentTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => unsubscribe();
    }, []);

    const toggleBell = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    return (
        <div className="relative">
            {/* 🔔 THE ANIMATED BELL */}
            <button
                onClick={toggleBell}
                className="relative p-2.5 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all group"
            >
                <Bell className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-12 ${hasUnread ? 'text-purple-600' : 'text-slate-400'}`} />

                {/* Notification Badge with Pulse */}
                {hasUnread && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {/* 📥 THE DROPDOWN */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-[350px] bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-300">

                    {/* Header */}
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Newest Patterns</h3>
                            <p className="text-[10px] font-bold text-slate-400">Fresh from the Multiverse</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                        {!appUser ? (
                            /* 🛑 UNREGISTERED STATE */
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500">
                                    <Zap className="w-8 h-8 fill-current" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 italic tracking-tighter">Login Required</h4>
                                <p className="text-xs text-slate-400 mt-2 font-medium">To unlock these premium patterns and start your generation journey, please join the community.</p>
                                <button className="mt-6 w-full py-3 bg-purple-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-purple-100">Unlock Access</button>
                            </div>
                        ) : (
                            /* ✅ LOGGED IN STATE */
                            <div className="divide-y divide-slate-50">
                                {recentTemplates.map((t, i) => (
                                    <div key={t.id} className="p-4 flex gap-4 hover:bg-slate-50 transition group cursor-pointer">
                                        <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                            <img src={t.marketplaceImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex items-center gap-1 text-pink-500 mb-0.5">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">New Drop</span>
                                                </div>
                                                <h5 className="text-sm font-black text-slate-900 truncate tracking-tight">{t.title}</h5>
                                            </div>
                                            <Link href="/" className="text-[9px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                Manifest This Style →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer CTA */}
                    {appUser && (
                        <div className="p-4 bg-white border-t border-slate-50 text-center">
                            <p className="text-[9px] font-bold text-slate-300 uppercase italic">"Your destiny is one pattern away."</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}