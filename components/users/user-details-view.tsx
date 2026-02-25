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
import { ArrowLeft, Search, Eye, User, Mail, Clock, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperDetailsDialog } from "@/components/wallpapers/wallpaper-details-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getListThumbnail } from "@/lib/utils";

interface UserDetailsViewProps {
    userId: string;
}

export default function UserDetailsView({ userId }: UserDetailsViewProps) {
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
                getCategories(activeConfig.firebase.projectId, 1, 1000),
            ]);

            setUser(userData);
            setCategories(categoriesData.data);

            if (userData && userData.favorites && userData.favorites.length > 0) {
                const ids = userData.favorites;
                const wallpapersData = await getWallpapersByIds(activeConfig.firebase.projectId, ids);
                setWallpapers(wallpapersData);

                const foundIds = wallpapersData.map(w => w.id);
                const missing = ids.filter(id => !foundIds.includes(id));
                setMissingIds(missing);
            } else {
                setWallpapers([]);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
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
                <p className="text-muted-foreground">Please select an app to view user info</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                    <p className="text-muted-foreground">
                        Viewing information for <span className="font-medium text-foreground">{user?.email || userId}</span>
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : (
                user && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                                        <AvatarFallback>{(user.displayName || user.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-xl font-bold">{user.displayName || "N/A"}</div>
                                        <div className="text-xs text-muted-foreground">Display Name</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Contact</CardTitle>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold truncate" title={user.email}>{user.email}</div>
                                <p className="text-xs text-muted-foreground">Email Address</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{user.lastLogin ? formatDate(user.lastLogin) : "N/A"}</div>
                                <p className="text-xs text-muted-foreground">Last Activity</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xl font-bold">
                                        {user.subscription?.isPremium ? "Premium" : "Free"}
                                    </div>
                                    {user.subscription?.isPremium && (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">PRO</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {user.subscription?.activeEntitlement || "No active plan"}
                                </p>
                                {user.subscription?.lastUpdated && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Updated: {formatDate(user.subscription.lastUpdated)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Favorites ({wallpapers.length})</h2>
                    <div className="relative w-64">
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
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : (
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
                                                    className="h-12 w-12 rounded object-cover"
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
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {wallpaper.downloads} DL · {wallpaper.likes} ♥
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={wallpaper.isActive ? "default" : "secondary"} className="w-fit">
                                                        {wallpaper.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                    {wallpaper.isPremium && (
                                                        <Badge variant="secondary" className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                                            Premium
                                                        </Badge>
                                                    )}
                                                </div>
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
                )}
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

            <WallpaperDetailsDialog
                wallpaper={viewWallpaper}
                open={!!viewWallpaper}
                onOpenChange={(open) => !open && setViewWallpaper(null)}
                categories={categories}
            />
        </div>
    );
}
