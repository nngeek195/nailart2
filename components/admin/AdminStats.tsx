import { Users, LayoutGrid, Activity, Zap } from "lucide-react";

type Props = {
    stats: { activeUsers: number; editors: number; pending: number };
};

export default function AdminStats({ stats }: Props) {
    // Mock Graph Data (Still needed unless we store history in DB)
    const graphData = [45, 70, 32, 85, 60, 95, 50];
    const maxVal = Math.max(...graphData);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* 1. Active Users */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Users</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeUsers}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Users className="w-6 h-6" /></div>
                </div>
            </div>

            {/* 2. Total Editors */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Editors</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.editors}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-100 text-purple-600"><LayoutGrid className="w-6 h-6" /></div>
                </div>
            </div>

            {/* 3. Pending Queue */}
            <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative ${stats.pending > 0 ? "ring-2 ring-yellow-400" : ""}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending Queue</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600"><Activity className="w-6 h-6" /></div>
                </div>
            </div>

            {/* 4. Generations Graph (Visual Only) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-orange-500 w-5 h-5" />
                    <h3 className="font-bold text-gray-900">Daily Generations</h3>
                </div>
                <div className="flex items-end justify-between h-24 gap-2">
                    {graphData.map((val, i) => (
                        <div key={i} className="w-full flex flex-col items-center gap-1 group">
                            <div className="w-full bg-orange-100 rounded-t-sm hover:bg-orange-500 transition-all duration-300 relative" style={{ height: `${(val / maxVal) * 100}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">{val}</div>
                            </div>
                            <span className="text-[10px] text-gray-400">D{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}