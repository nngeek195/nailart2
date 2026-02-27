"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import NotificationBell from "@/components/NotificationBell"; // 👈 Import our new component

export default function Header() {
    const { appUser } = useAuth();
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        if (query) {
            router.push(`/?search=${encodeURIComponent(query)}`);
        } else {
            router.push(`/`);
        }
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 fixed top-0 right-0 left-[280px] z-40 transition-all">

            {/* Unified Search Bar */}
            <div className="relative w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#7D2AE8] transition-colors" />
                <input
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search patterns, colors, or styles..."
                    className="w-full bg-slate-50 text-sm rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-[#7D2AE8]/5 focus:bg-white transition-all placeholder:text-slate-400 border border-transparent focus:border-[#7D2AE8]/20"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* 🔔 Our new animated notification system */}
                <NotificationBell />

                {appUser && (
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{appUser.username}</p>
                            <p className="text-[8px] font-bold text-purple-600 uppercase tracking-widest leading-none">Online</p>
                        </div>
                        <img
                            src={appUser.photoURL}
                            className="w-9 h-9 rounded-xl border-2 border-white shadow-sm object-cover"
                            alt="profile"
                        />
                    </div>
                )}
            </div>
        </header>
    );
}