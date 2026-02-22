"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/login");
        }
    }, [user, loading, isAdmin, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-64 w-96" />
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <div className="grid h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr] overflow-hidden">
            <div className="hidden border-r md:block h-full overflow-y-auto">
                <Sidebar />
            </div>
            <div className="flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
