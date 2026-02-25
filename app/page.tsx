"use client";
import TemplateCard from "@/components/TemplateCard";

const TEMPLATES = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i),
  title: `Galaxy Chrome ${i + 1}`,
  image: `https://picsum.photos/seed/nail${i}/400/500`,
  tags: i % 2 === 0 ? ["Chrome", "Summer"] : ["Matte", "Wedding"],
}));

export default function Home() {
  return (
    <div className="pt-24 px-8 max-w-7xl mx-auto pb-20">

      {/* 1. COLORFUL HERO SECTION */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
        {/* Gradient Background blob behind text */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 p-12 md:p-16 flex flex-col items-center text-center">


          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            What will you wear <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7D2AE8] via-[#FF4081] to-[#7D2AE8] bg-300% animate-gradient">
              today?
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mb-8">
            Transform your nail photos into professional designs instantly using our advanced AI engine.
          </p>

          <div className="flex gap-4">
            <button className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg hover:scale-105 duration-200">
              Start Creating
            </button>
            <button className="bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition hover:scale-105 duration-200">
              Browse Gallery
            </button>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
        {["#Chrome", "#Nude", "#Floral", "#Matte", "#Glitter", "#Neon"].map((cat, i) => (
          <button key={i} className="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all border hover:shadow-md bg-white hover:bg-gray-50 hover:border-[#7D2AE8] hover:text-[#7D2AE8]">
            {cat}
          </button>
        ))}
      </div>

      {/* 3. TEMPLATE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}