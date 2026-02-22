"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { createWallpaper } from "@/app/actions/wallpapers";
import { WallpaperForm } from "@/components/wallpapers/wallpaper-form";
import { WallpaperInput } from "@/lib/validations/wallpaper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateWallpaperPage() {
    const router = useRouter();
    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    const handleSubmit = async (data: WallpaperInput) => {
        if (!activeConfig) {
            alert("No app selected");
            return;
        }

        try {
            await createWallpaper(activeConfig.firebase.projectId, data);
            router.push("/wallpapers");
        } catch (error) {
            console.error("Error creating wallpaper:", error);
            alert("Failed to create wallpaper");
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">Create Wallpaper</h1>
                    <p className="text-muted-foreground">Add a new wallpaper to your collection</p>
                </div>
            </div>

            <WallpaperForm onSubmit={handleSubmit} submitLabel="Create Wallpaper" />
        </div>
    );
}
