"use client";
import { useState } from "react";
const categories = ["All", "Trending", "Summer", "Wedding", "Chrome", "Matte"];
export default function FilterChips() {
    const [active, setActive] = useState("All");
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
                <button key={cat} onClick={() => setActive(cat)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${active === cat ? "bg-[#7D2AE8] text-white shadow-md shadow-purple-500/20" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>{cat}</button>
            ))}
        </div>
    );
}