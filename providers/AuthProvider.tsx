"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext<any>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [appUser, setAppUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();

        // REMOVED: generative-language scope (The cause of Error 400)
        // ADDED: Google Drive scope only for file management
        provider.addScope("https://www.googleapis.com/auth/drive.file");

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                const newUser = {
                    uid: user.uid,
                    username: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: "user", // Default role
                    createdAt: new Date(),
                };
                await setDoc(doc(db, "users", user.uid), newUser);
                setAppUser(newUser);
            } else {
                setAppUser(userDoc.data());
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const signOut = () => firebaseSignOut(auth).then(() => setAppUser(null));

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setAppUser(userDoc.data());
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ appUser, loginWithGoogle, signOut, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);