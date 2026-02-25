"use client";
import Sidebar from "./Sidebar";
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-800">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden ml-64">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0 z-10">
                    <div className="relative w-96"><input type="text" placeholder="Search millions of patterns..." className="w-full bg-slate-100 text-sm rounded-full pl-4 pr-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" /></div>
                    <div className="ml-4 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400" />
                </header>
                <div className="flex-1 overflow-y-auto p-8"><div className="max-w-7xl mx-auto pb-20">{children}</div></div>
            </main>
        </div>
    );
}