"use client";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/hooks/useAdminData";
import AdminStats from "@/components/admin/AdminStats";
import UserManager from "@/components/admin/UserManager";
import PendingQueue from "@/components/admin/PendingQueue";
import InspectionModal from "@/components/admin/InspectionModal";

export default function AdminPage() {
    const { appUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    // Fetch Real Data
    const { users, pendingTemplates, stats, loading: dataLoading, toggleRole, deleteUser, approveTemplate, rejectTemplate } = useAdminData();

    // Protection
    if (authLoading) return <div className="p-10 text-center">Loading Admin...</div>;
    if (!appUser || appUser.role !== "admin") {
        router.push("/"); // Kick non-admins
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Real-time oversight and content control.</p>
            </div>

            {dataLoading ? (
                <div className="p-10 text-center">Loading Data...</div>
            ) : (
                <>
                    {/* 1. Stats */}
                    <AdminStats stats={stats} />

                    {/* 2. User Management */}
                    <UserManager
                        users={users}
                        onToggleRole={toggleRole}
                        onDeleteUser={deleteUser}
                    />

                    {/* 3. Pending Queue */}
                    <PendingQueue
                        templates={pendingTemplates}
                        onSelect={setSelectedTemplate}
                    />

                    {/* 4. Inspection Modal */}
                    <InspectionModal
                        template={selectedTemplate}
                        onClose={() => setSelectedTemplate(null)}
                        onApprove={approveTemplate}
                        onReject={rejectTemplate}
                    />
                </>
            )}
        </div>
    );
}