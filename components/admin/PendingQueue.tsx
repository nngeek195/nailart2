import { Clock } from "lucide-react";
import type { Template } from "@/hooks/useAdminData";

type Props = {
    templates: Template[];
    onSelect: (t: Template) => void;
};

export default function PendingQueue({ templates, onSelect }: Props) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-yellow-500 w-5 h-5" /> Pending Review
                </h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">{templates.length} Waiting</span>
            </div>

            {templates.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-400">All caught up! No pending templates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => onSelect(t)}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 cursor-pointer transition-all group overflow-hidden"
                        >
                            <div className="relative h-48 bg-gray-100">
                                <img src={t.marketplaceImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-mono text-gray-600 shadow-sm">
                                    {t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'New'}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-1 truncate">{t.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">by {t.editorName}</p>
                                <div className="flex flex-wrap gap-1">
                                    {t.tags?.map(tag => (
                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-semibold">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}