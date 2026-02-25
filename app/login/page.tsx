"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Paintbrush, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // 1. Authenticate with Email/Password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // 2. Fetch User Role from Firestore to decide where to go
            const userDoc = await getDoc(doc(db, "users", uid));

            if (userDoc.exists()) {
                const userRole = userDoc.data().role;

                // 3. Redirect based on Role
                if (userRole === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            } else {
                // Fallback if user doc is missing
                router.push("/");
            }

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else if (err.code === 'auth/user-not-found') {
                setError("No account found with this email.");
            } else {
                setError(err.message || "Login failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            {/* Decorative Background Blob */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-300/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081] rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/20">
                        <Paintbrush className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-2">Sign in to manage your designs</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7D2AE8] focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7D2AE8] focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#7D2AE8] hover:bg-[#6B21CC] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Protected by NailVirtuoso Security
                </div>
            </div>
        </div>
    );
}