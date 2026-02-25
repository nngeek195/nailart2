"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, X, Upload, AlertCircle } from "lucide-react";
import ImageCompareSlider from "@/components/ImageCompareSlider";
import type { Template } from "@/hooks/useAdminData";

type Props = {
    template: Template | null;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
};

export default function InspectionModal({ template, onClose, onApprove, onReject }: Props) {
    const [view, setView] = useState<"details" | "ai-test">("details");
    const [testFile, setTestFile] = useState<File | null>(null);
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleTestAI = async () => {
        if (!testFile) return;
        setIsTesting(true);
        // SIMULATION: In real app, upload to GCS, call API with ADMIN_KEY
        setTimeout(() => {
            setTestResult("https://picsum.photos/seed/admin-test/800/1000");
            setIsTesting(false);
        }, 2000);
    };

    const handleRejectSubmit = () => {
        if (template && rejectionReason.trim()) {
            onReject(template.id, rejectionReason);
            onClose();
        }
    };

    if (!template) return null;

    return (
        <Dialog open={!!template} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[#F9FAFB]">
                <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Inspect Template</h2>
                        <p className="text-sm text-gray-500">ID: {template.id} • Submitted by {template.editorName}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView(view === "details" ? "ai-test" : "details")} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${view === "ai-test" ? "bg-[#7D2AE8] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            {view === "ai-test" ? "View Metadata" : "Run AI Test"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 bg-black flex items-center justify-center p-8 relative">
                        {testResult && view === "ai-test" ? (
                            <div className="w-full h-full max-w-2xl">
                                <p className="text-white text-center mb-4 font-mono text-xs opacity-70">ADMIN TEST RESULT</p>
                                <ImageCompareSlider before={testResult} after={testResult} />
                            </div>
                        ) : (
                            <div className="flex gap-4 max-h-full overflow-y-auto">
                                <div className="text-center"><p className="text-white text-xs font-mono mb-2">MARKETPLACE</p><img src={template.marketplaceImage} className="h-64 object-cover rounded-lg shadow-2xl" /></div>
                                <div className="text-center"><p className="text-white text-xs font-mono mb-2">REFERENCE</p><img src={template.referenceImage} className="h-64 object-cover rounded-lg shadow-2xl" /></div>
                            </div>
                        )}
                    </div>

                    <div className="w-96 bg-white border-l flex flex-col">
                        {view === "details" ? (
                            <div className="p-6 space-y-6 overflow-y-auto">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Metadata</h3>
                                    <h4 className="text-2xl font-bold text-gray-900">{template.title}</h4>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {template.tags?.map(tag => <span key={tag} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-semibold">#{tag}</span>)}
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Admin Verdict</h3>

                                    <button onClick={() => onApprove(template.id)} className="w-full bg-[#00C4CC] hover:bg-[#00A8B0] text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 mb-3">
                                        <Check className="w-5 h-5" /> Approve Template
                                    </button>

                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <label className="block text-sm font-semibold text-red-800 mb-2">Rejection Reason</label>
                                        <textarea className="w-full bg-white border border-red-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none font-mono" rows={3} placeholder="e.g. Pattern is too blurry..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                                        <button onClick={handleRejectSubmit} disabled={!rejectionReason} className="mt-2 w-full bg-white border border-red-500 text-red-600 font-bold py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50">Reject with Feedback</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                                    <AlertCircle className="text-yellow-600 w-6 h-6 shrink-0" />
                                    <p className="text-sm text-yellow-800">This uses your <strong>Private API Key</strong>.</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center relative hover:bg-gray-50 transition">
                                    {testFile ? <span className="text-sm font-medium text-gray-700">{testFile.name}</span> : <><Upload className="text-gray-400 mb-2" /><span className="text-sm text-gray-500">Upload Test Hand</span></>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setTestFile(e.target.files?.[0] || null)} />
                                </div>
                                <button onClick={handleTestAI} disabled={!testFile || isTesting} className="w-full bg-[#7D2AE8] hover:bg-[#6B21CC] text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isTesting ? "Testing..." : "Run AI Test"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}