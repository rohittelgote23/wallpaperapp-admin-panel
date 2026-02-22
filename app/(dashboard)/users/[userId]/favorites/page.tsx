"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { getWallpapersByIds } from "@/app/actions/wallpapers";
import { getUser } from "@/app/actions/users";
import { getCategories } from "@/app/actions/categories";
import { Wallpaper } from "@/types/wallpaper";
import { Category } from "@/types/category";
import { AppUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperDetailsDialog } from "@/components/wallpapers/wallpaper-details-dialog";
import { getListThumbnail } from "@/lib/utils";

export default function UserFavoritesPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [user, setUser] = useState<AppUser | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewWallpaper, setViewWallpaper] = useState<Wallpaper | null>(null);
    const [missingIds, setMissingIds] = useState<string[]>([]);

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    useEffect(() => {
        loadData();
    }, [activeConfig, userId]);

    async function loadData() {
        if (!activeConfig || !userId) return;

        setLoading(true);
        try {
            const [userData, categoriesData] = await Promise.all([
                getUser(activeConfig.firebase.projectId, userId),
                getCategories(activeConfig.firebase.projectId),
            ]);

            setUser(userData);
            setCategories(categoriesData.data);

            if (userData && userData.favorites && userData.favorites.length > 0) {
                // Fetch wallpapers
                const ids = userData.favorites; // Fetch all? Or batch? 
                // getWallpapersByIds handles batching.
                const wallpapersData = await getWallpapersByIds(activeConfig.firebase.projectId, ids);
                setWallpapers(wallpapersData);

                // Calculate missing
                const foundIds = wallpapersData.map(w => w.id);
                const missing = ids.filter(id => !foundIds.includes(id));
                setMissingIds(missing);
            } else {
                setWallpapers([]);
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setLoading(false);
        }
    }

    const getCategoryName = (categoryId: string) => {
        return categories.find((c) => c.id === categoryId)?.name || categoryId;
    };

    const filteredWallpapers = wallpapers.filter((w) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            w.title.toLowerCase().includes(search) ||
            w.tags.some((tag) => tag.toLowerCase().includes(search))
        );
    });

    if (!activeConfig) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Please select an app to view favorites</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Favorites</h1>
                    <p className="text-muted-foreground">
                        Viewing favorites for <span className="font-medium text-foreground">{user?.email || userId}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Categories</TableHead>
                                    <TableHead>Stats</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWallpapers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No favorites found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredWallpapers.map((wallpaper) => (
                                        <TableRow key={wallpaper.id}>
                                            <TableCell>
                                                <img
                                                    src={getListThumbnail(wallpaper.thumbnail_url)}
                                                    alt={wallpaper.title}
                                                    className="h-16 w-16 rounded object-cover"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{wallpaper.title}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {wallpaper.categoryIds.slice(0, 2).map((catId) => (
                                                        <Badge key={catId} variant="secondary" className="text-xs">
                                                            {getCategoryName(catId)}
                                                        </Badge>
                                                    ))}
                                                    {wallpaper.categoryIds.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{wallpaper.categoryIds.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {wallpaper.downloads} DL · {wallpaper.likes} ♥ · {wallpaper.views} 👁
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={wallpaper.isActive ? "default" : "secondary"}>
                                                    {wallpaper.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewWallpaper(wallpaper)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {missingIds.length > 0 && (
                        <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20">
                            <p className="text-sm font-medium text-destructive mb-2">
                                Warning: {missingIds.length} favorite(s) could not be found (likely deleted):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingIds.map((id) => (
                                    <Badge key={id} variant="outline" className="font-mono text-xs border-destructive/50 text-destructive">
                                        {id}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <WallpaperDetailsDialog
                wallpaper={viewWallpaper}
                open={!!viewWallpaper}
                onOpenChange={(open) => !open && setViewWallpaper(null)}
                categories={categories}
            />
        </div>
    );
}
