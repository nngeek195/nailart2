"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, User, Plus, Shield, Paintbrush, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useEffect } from "react";
import LoginModal from "@/components/layout/LoginModal";

export default function Sidebar() {
    const pathname = usePathname();
    const { appUser, loginWithGoogle, signOut } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    // Navigation Items
    const mainNav = [
        { name: "Home", href: "/", icon: Home, id: "home" },
        { name: "Templates", href: "/", icon: LayoutGrid, id: "templates" },
        { name: "Saved", href: "/saved", icon: Heart, id: "saved" },
    ];

    return (
        <aside className="w-[280px] h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

            {/* 1. LOGO SECTION */}
            <div className="h-20 flex items-center px-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                        N
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-800">NailVirtuoso</span>
                </div>
            </div>

            {/* 2. THE COLORFUL "CREATE" BUTTON */}
            <div className="p-6">
                <button className="w-full group relative overflow-hidden rounded-xl p-[1px]">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7D2AE8] via-[#FF4081] to-[#7D2AE8] opacity-70 group-hover:opacity-100 transition-opacity animate-gradient-x" />
                    <div className="relative bg-white rounded-xl p-4 flex items-center justify-center gap-3 transition-transform active:scale-95">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7D2AE8] to-[#FF4081] flex items-center justify-center text-white shadow-md">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-800">Create Design</span>
                    </div>
                </button>
            </div>

            {/* 3. NAVIGATION LINKS */}
            <nav className="flex-1 px-4 space-y-1">
                <div className="px-4 py-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discover</p>
                    {mainNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === item.href
                                ? "bg-purple-50 text-[#7D2AE8]"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${pathname === item.href ? "text-[#7D2AE8]" : "text-gray-400"}`} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Role Based Links */}
                {(appUser?.role === 'editor' || appUser?.role === 'admin') && (
                    <div className="px-4 py-2 mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Studio</p>
                        <Link href="/editor" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            <Paintbrush className="w-5 h-5" /> Creator Studio
                        </Link>
                    </div>
                )}

                {appUser?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                        <Shield className="w-5 h-5" /> Admin Console
                    </Link>
                )}
            </nav>

            {/* 4. FOOTER / PROFILE */}
            <div className="p-4 border-t border-gray-100">
                {appUser ? (
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition cursor-pointer group">
                        <div className="relative">
                            <img
                                src={appUser.photoURL || "https://via.placeholder.com/40"}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#7D2AE8] transition-colors">
                                {appUser.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">View Profile</p>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowLogin(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#7D2AE8] hover:bg-purple-50 transition group"
                    >
                        <User className="w-5 h-5 text-gray-400 group-hover:text-[#7D2AE8] transition" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#7D2AE8] transition">Log In</span>
                    </button>
                )}
            </div>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </aside>
    );
}