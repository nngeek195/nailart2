"use client";
import GeneratorModal from "./GeneratorModal";

export default function TemplateCard({ template }: { template: any }) {
    // We use cleanTags which was parsed in the HomeContent component
    const tagsToShow = template.cleanTags || [];

    return (
        <GeneratorModal template={template}>
            <div className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="w-full py-3 bg-white text-black font-bold text-center rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            Try On Now
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate">{template.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {/* Fix: Check if tagsToShow is an array before mapping */}
                        {Array.isArray(tagsToShow) && tagsToShow.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </GeneratorModal>
    );
}