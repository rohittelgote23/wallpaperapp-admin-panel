"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAppStore } from "@/store/app-store";
import { initializeFirebase, getFirebaseInstances } from "@/lib/firebase/config";
import { getAvailableApps, getAppConfig } from "@/lib/config/apps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function LoginView() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedApp, setSelectedApp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { setActiveApp } = useAppStore();
    const availableApps = getAvailableApps();

    useEffect(() => {
        // Always default to 'lumio' if available, otherwise first app
        if (availableApps.length > 0) {
            const lumioApp = availableApps.find(app => app.id === "lumio");
            setSelectedApp(lumioApp ? lumioApp.id : availableApps[0].id);
        }
    }, [availableApps]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!selectedApp) {
                setError("Please select an app");
                setLoading(false);
                return;
            }

            const config = getAppConfig(selectedApp);

            if (!config) {
                setError("App configuration not found. Please check your environment variables.");
                setLoading(false);
                return;
            }

            // Initialize Firebase with selected app's config
            initializeFirebase(config.firebase);
            const { auth } = getFirebaseInstances();

            // Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Log the user UID for debugging
            console.log("✅ Login successful! User UID:", userCredential.user.uid);
            console.log("📋 Copy this UID and create a document in Firestore:");
            console.log("   Collection: admin_users");
            console.log("   Document ID:", userCredential.user.uid);

            // Set active app in store
            setActiveApp(selectedApp);

            // Redirect to dashboard
            router.push("/");
        } catch (err: any) {
            console.error("❌ Login error:", err);
            setError(err.message || "Failed to sign in. Please check your credentials.");
            setLoading(false);
        }
    };

    if (availableApps.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center text-red-600">
                            Configuration Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            No apps configured. Please add Firebase configurations to your .env.local file.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Admin Panel</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access the wallpaper management dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="text-center py-2">
                            <p className="text-sm text-muted-foreground">
                                Signing in to <span className="font-semibold text-foreground">Lumio Walls Admin</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
