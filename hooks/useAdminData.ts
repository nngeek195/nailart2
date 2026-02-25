import { useState, useEffect } from "react";
import { collection, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AppUser = {
    uid: string;
    email: string;
    username: string;
    role: "admin" | "editor" | "user";
    createdAt: any;
};

export type Template = {
    id: string;
    title: string;
    editorName: string;
    marketplaceImage: string;
    referenceImage: string;
    tags: string[];
    status: "pending" | "approved" | "rejected";
    adminComment?: string;
    createdAt: any;
};

export function useAdminData() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [pendingTemplates, setPendingTemplates] = useState<Template[]>([]);
    const [stats, setStats] = useState({ activeUsers: 0, editors: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch All Users (Once)
        const fetchUsers = async () => {
            const usersRef = collection(db, "users");
            const snapshot = await getDocs(usersRef);
            const usersList = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
            })) as AppUser[];
            setUsers(usersList);

            // Calculate Stats
            const activeUsersCount = usersList.length;
            const editorsCount = usersList.filter(u => u.role === 'editor').length;
            setStats(prev => ({ ...prev, activeUsers: activeUsersCount, editors: editorsCount }));
        };

        fetchUsers();

        // 2. Listen to Pending Templates (Real-time)
        const templatesRef = collection(db, "templates");
        const q = query(templatesRef, where("status", "==", "pending"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const templatesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Template[];
            setPendingTemplates(templatesList);
            setStats(prev => ({ ...prev, pending: templatesList.length }));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Action: Toggle User Role (User <-> Editor)
    const toggleRole = async (uid: string, currentRole: string) => {
        const newRole = currentRole === "editor" ? "user" : "editor";
        await updateDoc(doc(db, "users", uid), { role: newRole });
    };

    // Action: Delete User
    const deleteUser = async (uid: string) => {
        await deleteDoc(doc(db, "users", uid));
    };

    // Action: Approve Template
    const approveTemplate = async (id: string) => {
        await updateDoc(doc(db, "templates", id), { status: "approved" });
    };

    // Action: Reject Template
    const rejectTemplate = async (id: string, reason: string) => {
        await updateDoc(doc(db, "templates", id), {
            status: "rejected",
            adminComment: reason
        });
    };

    return { users, pendingTemplates, stats, loading, toggleRole, deleteUser, approveTemplate, rejectTemplate };
}