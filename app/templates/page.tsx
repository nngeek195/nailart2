"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import TemplateCard from "@/components/TemplateCard";

export default function AllPatternsPage() {
    const [mainTags, setMainTags] = useState<any[]>([]);
    const [selectedTag, setSelectedTag] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Main Spheres
        onSnapshot(query(collection(db, "tags"), where("isMain", "==", true)), (snap) => {
            setMainTags(snap.docs.map(d => d.data()));
        });

        // Fetch Approved Designs
        onSnapshot(query(collection(db, "templates"), where("status", "==", "approved")), (snap) => {
            setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    const filtered = selectedTag === "All"
        ? templates
        : templates.filter(t => t.tags?.includes(selectedTag));

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <h1 className="text-5xl font-black italic mb-12 tracking-tighter">Exploration <span className="text-purple-600">Spheres</span></h1>

            {/* THE SPHERES HUD */}
            <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10">
                <button onClick={() => setSelectedTag("All")} className="shrink-0 flex flex-col items-center gap-4 group">
                    <div className={`w-24 h-24 rounded-full border-4 transition-all flex items-center justify-center font-black ${selectedTag === "All" ? "border-purple-600 scale-110 shadow-lg" : "border-gray-200"}`}>All</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Universal</span>
                </button>

                {mainTags.map((tag, i) => (
                    <button key={i} onClick={() => setSelectedTag(tag.name)} className="shrink-0 flex flex-col items-center gap-4 group">
                        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all shadow-md ${selectedTag === tag.name ? "border-purple-600 scale-110" : "border-white"}`}>
                            <img src={tag.bgImage} className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTag === tag.name ? "text-purple-600" : "text-gray-400"}`}>{tag.name}</span>
                    </button>
                ))}
            </div>

            {/* RESULTS GRID */}
            <div className="columns-2 md:columns-4 gap-6 space-y-6 mt-10">
                {filtered.map(t => <TemplateCard key={t.id} template={t} />)}
            </div>
        </div>
    );
}