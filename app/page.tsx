"use client";
import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import TemplateCard from "@/components/TemplateCard";
import { Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

// 1. Create a sub-component to handle search logic
function HomeContent() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("#All");

  // Get search term from URL (must be inside Suspense)
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    // Fetch only approved templates
    const q = query(collection(db, "templates"), where("status", "==", "approved"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templateData = snapshot.docs.map((doc) => {
        const data = doc.data();

        // SAFE DATA PARSING
        let finalTags: string[] = [];

        if (Array.isArray(data.tags) && data.tags.length > 0) {
          const firstElement = data.tags[0];

          // Check if the first element is a stringified array like "["Space", "Dark"]"
          if (typeof firstElement === 'string' && firstElement.startsWith('[')) {
            try {
              // We clean the string and parse it into a real JS array
              finalTags = JSON.parse(firstElement.replace(/'/g, '"'));
            } catch (e) {
              finalTags = [firstElement]; // Fallback to raw string if parsing fails
            }
          } else {
            finalTags = data.tags; // It's already a clean array
          }
        }

        return {
          id: doc.id,
          ...data,
          cleanTags: finalTags, // Use this in TemplateCard
          image: data.marketplaceImage, // Map your Firestore field to UI prop
          title: data.title,
        };
      });
      setTemplates(templateData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter Logic: Combine Category Filter + Search Bar Input
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm) ||
      t.cleanTags.some((tag: string) => tag.toLowerCase().includes(searchTerm));

    const matchesFilter =
      activeFilter === "#All" ||
      t.cleanTags.includes(activeFilter.replace("#", ""));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* 2. HERO SECTION */}
      <section className="mb-12 p-12 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-[#7D2AE8] text-xs font-bold mb-6">
            <Sparkles className="w-3 h-3" /> VIRTUAL NAIL STUDIO
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight">
            Ready for a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D2AE8] to-[#FF4081]">
              new look?
            </span>
          </h1>
        </div>
      </section>

      {/* 3. FILTER CHIPS */}
      <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
        {["#All", "#Space", "#Dark", "#Chrome", "#Nude"].map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${activeFilter === tag
              ? "bg-gray-900 text-white border-gray-900 shadow-lg"
              : "bg-white text-gray-500 border-gray-200 hover:border-[#7D2AE8] hover:text-[#7D2AE8]"
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 4. TEMPLATE GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#7D2AE8] w-10 h-10" />
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredTemplates.map((t) => (
            <div key={t.id} className="break-inside-avoid">
              <TemplateCard template={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. Main Page Component with Suspense Boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}