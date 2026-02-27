"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Sparkles, RefreshCcw, CheckCircle2, Clock, HardDrive, AlertTriangle, Loader2 } from "lucide-react";
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
    const [cooldown, setCooldown] = useState(0);

    // 🕒 Lockout Timer Logic
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // 💎 EFFICIENT IMAGE PROCESSING: Reduces tokens to avoid 429 errors
    const processImage = (file: File): Promise<string> => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; // Small size = Low tokens = Stability
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.5)); // JPEG 0.5 is the token-saving hero
            };
        };
    });

    const startGeneration = async (retryCount = 0) => {
        if (!file || !appUser || cooldown > 0) return;

        setStep("generating");
        setProgress(20);

        // 🛑 TIMEOUT GUARD (Ensures the app doesn't stay stuck)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            const handBase64 = await processImage(file);

            const response = await fetch("/api/generate", {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handImage: handBase64, templateRef: template.image }),
            });

            clearTimeout(timeoutId);

            // 🛡️ QUOTA RECOVERY: Auto-wait 17s if 429 occurs
            if (response.status === 429 && retryCount < 1) {
                console.warn("Quota rift detected. Manifesting patience...");
                setProgress(429);
                await new Promise(res => setTimeout(res, 17000));
                return startGeneration(retryCount + 1);
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || "AI Core unstable");
            }

            const data = await response.json();
            if (data.output) {
                setResultImage(data.output);

                // 📁 SAVE TO FIREBASE (Immediate Sync)
                await addDoc(collection(db, "generations"), {
                    userId: appUser.uid,
                    templateId: template.id,
                    templateTitle: template.title,
                    resultImage: data.output,
                    createdAt: serverTimestamp(),
                    tags: template.tags || []
                });

                // 📊 INCREMENT USER STATS
                await updateDoc(doc(db, "users", appUser.uid), {
                    generationCount: increment(1)
                });

                // ☁️ BACKGROUND DRIVE SYNC
                syncToGDrive(data.output, template.title);

                setStep("result");
                setCooldown(15); // Balanced cooldown for stability
            }
            // Inside GeneratorModal.tsx catch block:
        } catch (err: any) {
            setStep("upload");

            // Check if it's a real timeout or an API error
            let displayMessage = "";
            if (err.name === 'AbortError') {
                displayMessage = "The AI Core is taking too long. Check your server logs for a 404 or Quota error.";
            } else {
                // 🛡️ SHOW THE ACTUAL ERROR FROM THE API
                displayMessage = `Rift Error: ${err.message}`;
            }

            alert(displayMessage);
        }
    };

    const syncToGDrive = async (base64: string, title: string) => {
        try {
            await fetch('/api/drive/upload', {
                method: 'POST',
                body: JSON.stringify({ image: base64, name: title })
            });
        } catch (e) { console.warn("Drive sync deferred."); }
    };

    return (
        <Dialog onOpenChange={(open) => !open && setStep("upload")}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col bg-white border-none rounded-[3.5rem] shadow-2xl">
                {/* --- HEADER --- */}
                <div className="px-10 py-6 flex justify-between items-center border-b border-slate-50">
                    <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent italic tracking-tighter">
                        NailVirtuoso Studio
                    </DialogTitle>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stable Core 2.0</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                    {/* LEFT: REFERENCE VIEW */}
                    <div className="w-full md:w-1/2 bg-slate-50/50 p-12 flex flex-col items-center justify-center border-r border-slate-100">
                        <div className="relative group w-full max-w-sm">
                            <img src={template.image} className="rounded-[2.5rem] shadow-2xl w-full object-cover aspect-[3/4] border-4 border-white transition-transform group-hover:scale-105 duration-700" />
                        </div>
                        <h3 className="mt-8 text-2xl font-black text-slate-900 italic tracking-tight">{template.title}</h3>
                    </div>

                    {/* RIGHT: ACTION AREA */}
                    <div className="w-full md:w-1/2 p-12 flex flex-col bg-white justify-center">
                        {step === "upload" && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Manifest style.</h3>
                                <p className="text-slate-400 mb-12 font-medium">Upload your source hand photo to begin the AI application.</p>

                                <div className="relative border-2 border-dashed border-slate-100 rounded-[3rem] aspect-square max-h-80 flex flex-col items-center justify-center overflow-hidden hover:border-purple-200 hover:bg-purple-50/20 transition-all cursor-pointer group mb-10">
                                    {preview ? (
                                        <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-500">
                                                <Upload className="w-8 h-8 text-purple-600" />
                                            </div>
                                            <p className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em]">Select Source Image</p>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                </div>

                                <button onClick={() => startGeneration()} disabled={!file || cooldown > 0} className="w-full h-20 bg-slate-900 rounded-[2rem] font-black text-white shadow-2xl flex items-center justify-center gap-4 disabled:opacity-30 active:scale-95 transition-all">
                                    {cooldown > 0 ? <><Clock className="w-5 h-5 text-purple-400" /> Cooldown: {cooldown}s</> : <><Sparkles className="w-6 h-6 text-purple-400" /> Manifest Nails</>}
                                </button>
                            </div>
                        )}

                        {step === "generating" && (
                            <div className="flex flex-col items-center text-center px-10 animate-in fade-in duration-500">
                                {progress === 429 ? (
                                    <div className="space-y-6">
                                        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm border border-orange-100">
                                            <AlertTriangle className="text-orange-500 w-10 h-10 animate-pulse" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Crowded Multiverse</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">High traffic detected. Waiting 17 seconds for a clean rift in the quota pool...</p>
                                        <Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto mt-4" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative w-44 h-44 mb-10">
                                            <div className="absolute inset-0 border-8 border-slate-50 rounded-full" />
                                            <div className="absolute inset-0 border-8 border-t-purple-600 border-r-pink-500 rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-slate-900 tracking-tighter italic">{progress}%</div>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">Gemini 2.0 Processing</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-4 animate-pulse italic">Applying Neural Overlays</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FULL OVERLAY RESULT */}
                    {step === "result" && (
                        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in zoom-in-95 duration-700">
                            <div className="flex-1 relative bg-slate-900">
                                <ImageCompareSlider before={preview || ""} after={resultImage || ""} />
                                <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-2xl border border-white/20 text-white px-6 py-2.5 rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Manifestation Success
                                </div>
                            </div>

                            <div className="h-72 bg-white border-t border-slate-50 p-12 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                    <HardDrive className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Saved to Profile & Cloud</span>
                                </div>
                                <h4 className="text-4xl font-black italic mb-10 tracking-tighter">Your style is ready.</h4>
                                <button onClick={() => setStep("upload")} className="w-full max-w-md h-16 bg-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-white shadow-2xl hover:bg-purple-600 transition-colors">Close Studio</button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}