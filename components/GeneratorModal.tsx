"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Sparkles, RefreshCcw, CheckCircle2, ChevronRight } from "lucide-react";
import ImageCompareSlider from "@/components/ImageCompareSlider";

type Props = {
    template: { id: string; title: string; image: string; tags: string[] };
    children: React.ReactNode;
};

export default function GeneratorModal({ template, children }: Props) {
    const { appUser } = useAuth();
    const [step, setStep] = useState<"upload" | "generating" | "result">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Clean up memory when preview changes
    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const startGeneration = async () => {
        if (!file || !appUser) return;
        setStep("generating");
        setProgress(0);

        // Simulation of the dual-progress you wanted (Upload -> Process)
        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 150);

        // REAL API CALL LATER: await fetch('/api/generate', ...)
        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setResultImage("https://picsum.photos/seed/nail_result/800/1000"); // Mock Result
            setStep("result");
        }, 3000);
    };

    return (
        <Dialog onOpenChange={(open) => !open && setStep("upload")}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col bg-white border-none rounded-3xl">
                {/* Visual Header (Always Visible) */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#7D2AE8] to-[#FF4081] bg-clip-text text-transparent">
                        NailVirtuoso Studio
                    </DialogTitle>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                    {/* LEFT SIDE: Template View */}
                    <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
                        <div className="relative group w-full max-w-sm">
                            <img
                                src={template.image}
                                alt={template.title}
                                className="rounded-2xl shadow-2xl w-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#7D2AE8] shadow-sm">
                                SELECTED TEMPLATE
                            </div>
                        </div>
                        <h3 className="mt-6 text-lg font-semibold text-gray-800">{template.title}</h3>
                        <div className="flex gap-2 mt-2">
                            {template.tags.map(tag => (
                                <span key={tag} className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-200/50 px-2 py-1 rounded-md">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Action Area */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col bg-white">
                        {step === "upload" && (
                            <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Try it on.</h3>
                                <p className="text-gray-500 mb-8 italic">Upload a clear photo of your hand for best results.</p>

                                <div className="relative border-2 border-dashed border-gray-200 rounded-3xl aspect-square max-h-80 flex flex-col items-center justify-center overflow-hidden hover:border-[#7D2AE8] hover:bg-purple-50/20 transition-all cursor-pointer group mb-8">
                                    {preview ? (
                                        <>
                                            <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <RefreshCcw className="text-white w-8 h-8" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                                                <Upload className="w-8 h-8 text-[#7D2AE8]" />
                                            </div>
                                            <p className="font-bold text-gray-700">Drop your hand photo here</p>
                                            <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                </div>

                                <button
                                    onClick={startGeneration}
                                    disabled={!file}
                                    className="w-full h-16 btn-gradient rounded-2xl font-bold text-white shadow-lg shadow-purple-200 flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Sparkles className="w-6 h-6" /> Generate My Nail Art
                                </button>
                            </div>
                        )}

                        {step === "generating" && (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                                <div className="relative w-32 h-32 mb-8">
                                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                                    <div
                                        className="absolute inset-0 border-4 border-t-[#7D2AE8] border-r-[#FF4081] rounded-full animate-spin"
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-gray-700">
                                        {progress}%
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Creating the Magic</h3>
                                <p className="text-gray-500 animate-pulse">Our AI is meticulously painting your nails...</p>
                            </div>
                        )}
                    </div>

                    {/* FULL OVERLAY FOR RESULT (To allow the slider to use full space) */}
                    {step === "result" && (
                        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex-1 relative bg-black">
                                <ImageCompareSlider
                                    before={preview || template.image}
                                    after={resultImage || ""}
                                />
                                <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Comparison View
                                </div>
                            </div>

                            {/* Canva-style Suggestions Footer */}
                            <div className="h-56 bg-white border-t border-gray-100 p-6 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800">You might also like</h4>
                                    <button className="text-xs font-bold text-[#7D2AE8] flex items-center hover:underline">
                                        VIEW ALL <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="min-w-[120px] h-full bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-[#7D2AE8] transition-all">
                                            <img src={`https://picsum.photos/seed/${i + 10}/200/200`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <button onClick={() => setStep("upload")} className="flex-1 h-12 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition">
                                        Try New Photo
                                    </button>
                                    <button className="flex-[2] h-12 btn-gradient rounded-xl font-bold text-white shadow-lg">
                                        Save to My Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}