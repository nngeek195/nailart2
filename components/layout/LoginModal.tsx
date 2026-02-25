"use client";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";

type Props = { onClose: () => void };

export default function LoginModal({ onClose }: Props) {
    const { loginWithGoogle } = useAuth();

    const handleLogin = async () => {
        await loginWithGoogle();
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0 overflow-hidden bg-white rounded-2xl">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#7D2AE8] to-[#FF4081] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                        <span className="text-3xl font-bold">NV</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to NailVirtuoso</h2>
                    <p className="text-sm text-gray-500 mb-6">Sign in to save your designs and sync with Google Cloud.</p>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                    <p className="text-xs text-gray-400">By continuing, you agree to our Terms of Service.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}