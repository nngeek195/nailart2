"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User as FirebaseUser,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// FIX: Added photoURL to the type
type AppUser = {
    uid: string;
    email: string;
    username: string;
    role: "admin" | "editor" | "user";
    geminiConnected: boolean;
    refreshToken?: string;
    photoURL?: string | null; // <--- ADDED THIS
};

type AuthContextType = {
    appUser: AppUser | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    appUser: null,
    loading: true,
    loginWithGoogle: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setAppUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        username: userDoc.data().username || firebaseUser.displayName || "User",
                        role: userDoc.data().role || "user",
                        geminiConnected: userDoc.data().geminiConnected || false,
                        refreshToken: userDoc.data().refreshToken,
                        photoURL: userDoc.data().photoURL || firebaseUser.photoURL, // <--- USE THIS
                    });
                } else {
                    // First time login
                    await setDoc(userDocRef, {
                        email: firebaseUser.email,
                        username: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL, // <--- SAVE THIS
                        role: "user",
                        geminiConnected: true,
                        refreshToken: "mock_secure_token",
                        createdAt: serverTimestamp(),
                    });
                    setAppUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        username: firebaseUser.displayName || "User",
                        role: "user",
                        geminiConnected: true,
                        photoURL: firebaseUser.photoURL, // <--- SET THIS
                    });
                }
            } else {
                setAppUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/generative-language');
        provider.addScope('https://www.googleapis.com/auth/drive.file');

        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Login Error", error);
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ appUser, loading, loginWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);