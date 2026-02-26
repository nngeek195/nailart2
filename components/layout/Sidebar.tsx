"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, LayoutGrid, Heart, User, Plus,
    Shield, Paintbrush, LogOut, Settings, Loader2
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import LoginModal from "@/components/layout/LoginModal";

export default function Sidebar() {
    const pathname = usePathname();
    const { appUser, signOut, loading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    // Helper to check active state (handles sub-routes better)
    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname.startsWith(path);
    };

    const navItemClasses = (path: string) => `
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300
        ${isActive(path)
            ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
    `;

    return (
        <aside className="w-[280px] h-screen bg-white border-r border-slate-100 fixed left-0 top-0 flex flex-col z-50">

            {/* 1. BRAND SECTION */}
            <div className="h-20 flex items-center px-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-purple-100 group-hover:rotate-6 transition-transform">
                        N
                    </div>
                    <span className="text-xl font-black tracking-tighter text-slate-900">NailVirtuoso</span>
                </Link>
            </div>



            {/* 3. SCROLLABLE NAVIGATION */}
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">

                {/* MAIN DISCOVERY */}
                <section>
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Discover</p>
                    <div className="space-y-1">
                        <Link href="/" className={navItemClasses("/")}>
                            <Home className="w-5 h-5" /> Home
                        </Link>
                        <Link href="/templates" className={navItemClasses("/templates")}>
                            <LayoutGrid className="w-5 h-5" /> All Patterns
                        </Link>
                        <Link href="/saved" className={navItemClasses("/saved")}>
                            <Heart className="w-5 h-5" /> Saved Styles
                        </Link>
                    </div>
                </section>

                {/* CREATOR STUDIO SECTION (Hidden from regular mortals) */}
                {(appUser?.role === 'editor' || appUser?.role === 'admin') && (
                    <section className="animate-in fade-in slide-in-from-left-2 duration-500">
                        <p className="px-4 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-3">Studio</p>
                        <div className="space-y-1">
                            <Link href="/editor" className={navItemClasses("/editor")}>
                                <Paintbrush className="w-5 h-5" /> Creator Studio
                            </Link>
                        </div>
                    </section>
                )}

                {/* ADMIN CONSOLE SECTION (The Supreme Guard) */}
                {appUser?.role === 'admin' && (
                    <section className="animate-in fade-in slide-in-from-left-2 duration-700">
                        <p className="px-4 text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">Supreme Control</p>
                        <div className="space-y-1">
                            <Link href="/admin" className={navItemClasses("/admin")}>
                                <Shield className="w-5 h-5" /> Admin Console
                            </Link>
                        </div>
                    </section>
                )}
            </nav>

            {/* 4. USER AUTH & PROFILE SECTION */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                {loading ? (
                    <div className="flex justify-center p-2"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                ) : appUser ? (
                    <div className="flex items-center justify-between gap-3">
                        <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
                            <img
                                src={appUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Nail"}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:scale-105 transition"
                                alt="avatar"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{appUser.username}</p>
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tighter">
                                    {appUser.role || 'Member'}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={signOut}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                            title="Logout from system"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowLogin(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-600 hover:bg-purple-50 transition group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition">
                            <User className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                        </div>
                        <span className="text-sm font-black text-slate-600 group-hover:text-purple-600 transition">Log In</span>
                    </button>
                )}
            </div>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </aside>
    );
}