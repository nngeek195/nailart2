"use client";
import { useEffect, useState } from "react";
import { Activity, ShieldCheck, AlertCircle } from "lucide-react";

export default function ApiStatus() {
    const [status, setStatus] = useState<any>(null);

    const checkHealth = async () => {
        const res = await fetch("/api/admin/health");
        const data = await res.json();
        setStatus(data);
    };

    useEffect(() => { checkHealth(); }, []);

    if (!status) return <div className="animate-pulse text-slate-400">Scanning Rifts...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-[2rem]">
            {/* Gemini Card */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center justify-between">
                <div>
                    <h4 className="font-black italic text-slate-900">GEMINI 3.1</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{status.gemini.message}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${status.gemini.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            </div>

            {/* Hugging Face Card */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center justify-between">
                <div>
                    <h4 className="font-black italic text-slate-900">FLUX.1 [HF]</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{status.huggingface.message}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                    status.huggingface.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                    status.huggingface.status === 'loading' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                }`} />
            </div>
        </div>
    );
}