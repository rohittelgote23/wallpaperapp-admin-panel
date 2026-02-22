"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallpaper } from "@/types/wallpaper";
import { Category } from "@/types/category";
import { formatDate } from "@/lib/utils";
import { Download, Eye, Heart, Calendar, FileText, Hash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface WallpaperDetailsDialogProps {
    wallpaper: Wallpaper | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
}

export function WallpaperDetailsDialog({
    wallpaper,
    open,
    onOpenChange,
    categories,
}: WallpaperDetailsDialogProps) {
    const router = useRouter();

    if (!wallpaper) return null;

    const getCategoryName = (id: string) => {
        return categories.find((c) => c.id === id)?.name || id;
    };

    const isVideoUrl = (url: string) => {
        if (!url) return false;
        return url.includes("/video/") || url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Wallpaper Details</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Left Column: Image (1/3) */}
                    <div className="space-y-4 md:col-span-1">
                        <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden border flex items-center justify-center">
                            {isVideoUrl(wallpaper.full_url) ? (
                                <video
                                    src={wallpaper.full_url}
                                    controls
                                    className="object-cover w-full h-full"
                                // poster={wallpaper.thumbnail_url}
                                />
                            ) : (
                                <Image
                                    src={wallpaper.full_url}
                                    alt={wallpaper.title}
                                    fill
                                    className="object-cover"
                                    unoptimized={isVideoUrl(wallpaper.full_url)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details (2/3) */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Title & Metadata (2/3) */}
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-2xl font-bold">{wallpaper.title}</h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            if (wallpaper) {
                                                router.push(`/wallpapers/${wallpaper.id}/edit`);
                                            }
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={wallpaper.isActive ? "default" : "secondary"}>
                                        {wallpaper.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    {wallpaper.isPremium && (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                            Premium
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground font-mono">
                                        ID: {wallpaper.id}
                                    </span>
                                </div>
                            </div>

                            {/* Compact Stats (1/3) */}
                            <div className="flex justify-end gap-4 md:col-span-1">
                                <div className="flex flex-col items-center">
                                    <Download className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="font-bold">{wallpaper.downloads}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Heart className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="font-bold">{wallpaper.likes}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Eye className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="font-bold">{wallpaper.views}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Description
                            </h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {wallpaper.info || "No description available."}
                            </p>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4" /> Categories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {wallpaper.categoryIds.map((catId) => (
                                    <Badge key={catId} variant="outline">
                                        {getCategoryName(catId)}
                                    </Badge>
                                ))}
                                {wallpaper.categoryIds.length === 0 && (
                                    <span className="text-sm text-muted-foreground">No categories</span>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        {wallpaper.tags && wallpaper.tags.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <Hash className="h-4 w-4" /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {wallpaper.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {wallpaper.color_palette && wallpaper.color_palette.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Color Palette</h3>
                                <div className="flex flex-wrap gap-2">
                                    {wallpaper.color_palette.map((color, index) => (
                                        <div
                                            key={index}
                                            className="w-8 h-8 rounded-full border shadow-sm"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Created
                                </span>
                                <span>
                                    {wallpaper.createdAt
                                        ? formatDate(wallpaper.createdAt)
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Image URL</span>
                                <a
                                    href={wallpaper.full_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 hover:underline truncate max-w-[200px]"
                                >
                                    Open Original
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
