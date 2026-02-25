"use client";
import GeneratorModal from "@/components/GeneratorModal";

type Template = {
    id: string;
    title: string;
    image: string;
    tags: string[];
};

export default function TemplateCard({ template }: { template: Template }) {
    return (
        <GeneratorModal template={template}>
            {/* This div is now passed as 'children' to GeneratorModal */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                    <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{template.title}</h3>
                    <div className="flex gap-2 mt-2">
                        {template.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </GeneratorModal>
    );
}