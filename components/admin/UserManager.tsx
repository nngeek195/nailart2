import { Shield, ShieldAlert, Trash2, MoreHorizontal } from "lucide-react";
import type { AppUser } from "@/hooks/useAdminData";

type Props = {
    users: AppUser[];
    onToggleRole: (uid: string, role: string) => void;
    onDeleteUser: (uid: string) => void;
};

export default function UserManager({ users, onToggleRole, onDeleteUser }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">User Management</h3>
            </div>

            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Role</th>
                        <th className="px-8 py-4">Joined</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50 transition">
                            <td className="px-8 py-4">
                                <div className="font-medium text-gray-900">{user.username || "No Name"}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-8 py-4">
                                <button
                                    onClick={() => onToggleRole(user.uid, user.role)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200 cursor-not-allowed' :
                                        user.role === 'editor' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                        }`}
                                    disabled={user.role === 'admin'} // Can't demote yourself or other admins easily in this simple UI
                                >
                                    {user.role === 'admin' ? <Shield className="w-3 h-3" /> : user.role === 'editor' ? <ShieldAlert className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-gray-400" />}
                                    {user.role.toUpperCase()}
                                </button>
                            </td>
                            <td className="px-8 py-4 text-sm text-gray-600">
                                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="px-8 py-4 text-right">
                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this user?")) {
                                                onDeleteUser(user.uid);
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}