"use client";
import GeneratorModal from "./GeneratorModal";
import SaveHeart from "./SaveHeart";

export default function TemplateCard({ template }: { template: any }) {
    const tagsToShow = template.tags || []; // Use 'tags' directly as we fixed the array issue

    return (
        <GeneratorModal template={template}>
            <div className="group relative cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">

                {/* HEART POSITIONING */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <SaveHeart templateId={template.id} />
                </div>

                <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                        src={template.marketplaceImage || template.image}
                        alt={template.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest text-center rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            Try On Now
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-black text-gray-900 truncate tracking-tight">{template.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(tagsToShow) && tagsToShow.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </GeneratorModal>
    );
}