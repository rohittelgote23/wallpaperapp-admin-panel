"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getFirebaseInstances, initializeFirebase } from "@/lib/firebase/config";
import { getAppConfig } from "@/lib/config/apps";
import { setCloudinaryConfig } from "@/lib/cloudinary/config";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    const { activeAppId, setCurrentUser, hasHydrated } = useAppStore();

    useEffect(() => {
        // Wait for store hydration before doing anything
        if (!hasHydrated) return;

        // Force use Lumio configuration for Authentication
        // This ensures Single Sign-On (SSO) works across all apps
        const lumioConfig = getAppConfig("lumio");

        if (!lumioConfig) {
            console.error("Lumio configuration not found!");
            setLoading(false);
            return;
        }

        // Initialize Firebase with Lumio config
        try {
            initializeFirebase(lumioConfig.firebase);
            // Default Cloudinary to active app or Lumio if not set
            const currentConfig = activeAppId ? getAppConfig(activeAppId) : lumioConfig;
            if (currentConfig) {
                setCloudinaryConfig(currentConfig.cloudinary);
            }

            const { auth, firestore } = getFirebaseInstances();

            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                setUser(user);

                if (user) {
                    // Check if user exists in admin_users collection
                    try {
                        const adminDoc = await getDoc(doc(firestore, "admin_users", user.uid));
                        const adminRole = adminDoc.exists();
                        setIsAdmin(adminRole);

                        if (adminRole) {
                            setCurrentUser({
                                uid: user.uid,
                                email: user.email || "",
                                role: "admin",
                            });
                        } else {
                            setCurrentUser(null);
                            router.push("/login");
                        }
                    } catch (error) {
                        console.error("Error checking admin role:", error);
                        setIsAdmin(false);
                        setCurrentUser(null);
                    }
                } else {
                    setIsAdmin(false);
                    setCurrentUser(null);
                }

                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Auth initialization error:", error);
            setLoading(false);
        }
    }, [setCurrentUser, router, hasHydrated, activeAppId]);

    const signOut = async () => {
        try {
            const { auth } = getFirebaseInstances();
            await firebaseSignOut(auth);
            setCurrentUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
