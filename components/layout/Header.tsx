"use client";

import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

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
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-[280px] z-40 transition-all">

            {/* Unified Search Bar */}
            <div className="relative w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#7D2AE8] transition-colors" />
                <input
                    type="text"
                    onChange={handleSearch}
                    placeholder="Search patterns, colors, or styles..."
                    className="w-full bg-gray-100 text-sm rounded-full pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7D2AE8]/20 focus:bg-white transition-all placeholder:text-gray-500 shadow-inner border border-transparent focus:border-[#7D2AE8]"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition relative">
                    <Bell className="w-5 h-5" />
                    {appUser && <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4081] rounded-full border border-white"></span>}
                </button>
                {appUser && (
                    <img src={appUser.photoURL} className="w-8 h-8 rounded-full border border-gray-200" alt="profile" />
                )}
            </div>
        </header>
    );
}