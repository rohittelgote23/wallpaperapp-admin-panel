"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getWallpaper, updateWallpaper } from "@/app/actions/wallpapers";
import { WallpaperForm } from "@/components/wallpapers/wallpaper-form";
import { WallpaperInput } from "@/lib/validations/wallpaper";
import { Wallpaper } from "@/types/wallpaper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditWallpaperPage() {
    const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const params = useParams();
    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    useEffect(() => {
        async function loadWallpaper() {
            if (!activeConfig || !params.id) return;

            try {
                const data = await getWallpaper(
                    activeConfig.firebase.projectId,
                    params.id as string
                );
                setWallpaper(data);
            } catch (error) {
                console.error("Error loading wallpaper:", error);
            } finally {
                setLoading(false);
            }
        }

        loadWallpaper();
    }, [activeConfig, params.id]);

    const handleSubmit = async (data: WallpaperInput) => {
        if (!activeConfig || !params.id) return;

        try {
            await updateWallpaper(
                activeConfig.firebase.projectId,
                params.id as string,
                data
            );
            router.push("/wallpapers");
        } catch (error) {
            console.error("Error updating wallpaper:", error);
            alert("Failed to update wallpaper");
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!wallpaper) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Wallpaper not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/wallpapers">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Wallpaper</h1>
                    <p className="text-muted-foreground">Update wallpaper details</p>
                </div>
            </div>

            <WallpaperForm
                initialData={wallpaper}
                onSubmit={handleSubmit}
                submitLabel="Update Wallpaper"
            />
        </div>
    );
}
