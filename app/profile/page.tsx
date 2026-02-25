"use client";
import { useAuth } from "@/providers/AuthProvider";
import { Grid3X3, Bookmark, Settings, Plus } from "lucide-react";

export default function ProfilePage() {
    const { appUser } = useAuth();

    return (
        <div className="max-w-4xl mx-auto pt-10 px-4 pb-20">
            {/* HEADER SECTION */}
            <div className="flex items-center gap-12 mb-12">
                <div className="relative group cursor-pointer">
                    <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081]">
                        <img
                            src={appUser?.photoURL || "/default-avatar.png"}
                            className="w-full h-full rounded-full border-4 border-white object-cover"
                        />
                    </div>
                    <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:scale-110 transition">
                        <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-6 mb-4">
                        <h2 className="text-2xl font-light text-gray-800">{appUser?.username || "Niranga"}</h2>
                        <button className="px-6 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition">Edit Profile</button>
                    </div>
                    <div className="flex gap-8 text-gray-700">
                        <span><strong>24</strong> generations</span>
                        <span><strong>12</strong> templates</span>
                    </div>
                </div>
            </div>

            {/* HIGHLIGHTS (The "Small Circular Balls") */}
            <div className="flex gap-6 mb-12 overflow-x-auto pb-4 no-scrollbar">
                {["Best Sellers", "Wedding", "Chrome", "Summer"].map((label) => (
                    <div key={label} className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-16 h-16 rounded-full border border-gray-200 p-0.5 hover:scale-105 transition cursor-pointer">
                            <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-[#7D2AE8]">
                                <Plus className="w-6 h-6" />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                    </div>
                ))}
            </div>

            {/* TABS & GRID */}
            <div className="border-t border-gray-200">
                <div className="flex justify-center gap-12 -mt-px">
                    <button className="flex items-center gap-2 py-4 border-t border-gray-900 text-xs font-bold tracking-widest uppercase">
                        <Grid3X3 className="w-4 h-4" /> GENERATIONS
                    </button>
                    <button className="flex items-center gap-2 py-4 text-gray-400 text-xs font-bold tracking-widest uppercase">
                        <Bookmark className="w-4 h-4" /> SAVED
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-6 mt-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 group relative overflow-hidden cursor-pointer rounded-lg">
                            <img src={`https://picsum.photos/seed/nail${i}/500/500`} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <span className="font-bold">View Result</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}