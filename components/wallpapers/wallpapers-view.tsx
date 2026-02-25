"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { getWallpapers, deleteWallpaper } from "@/app/actions/wallpapers";
import { getCategories } from "@/app/actions/categories";
import { Wallpaper } from "@/types/wallpaper";
import { Category } from "@/types/category";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { getListThumbnail } from "@/lib/utils";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PaginationControls } from "../ui/pagination-controls";

const WallpaperDetailsDialog = dynamic(
    () => import("@/components/wallpapers/wallpaper-details-dialog").then(mod => mod.WallpaperDetailsDialog),
    { ssr: false }
);

export default function WallpapersView() {
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [wallpaperToDelete, setWallpaperToDelete] = useState<string | null>(null);
    const [viewWallpaper, setViewWallpaper] = useState<Wallpaper | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalWallpapers, setTotalWallpapers] = useState(0);

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, [activeConfig, currentPage, itemsPerPage]); // Removed searchTerm, handled by debounce setup

    useEffect(() => {
        // debounce search term
        const delayDebounceFn = setTimeout(() => {
            if (activeConfig) {
                // To avoid multiple refetches on initial load, only fetch if it's an actual search change or we already loaded
                if (!loading) {
                    setCurrentPage(1);
                    loadData(true);
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeConfig]);

    async function loadData(forceSearch = false) {
        if (!activeConfig) return;

        setLoading(true);
        try {
            const promises: Promise<any>[] = [
                getWallpapers(activeConfig.firebase.projectId, {
                    search: searchTerm || undefined,
                    page: forceSearch ? 1 : currentPage,
                    limit: itemsPerPage
                })
            ];

            // Only fetch categories if we haven't already
            if (categories.length === 0) {
                promises.push(getCategories(activeConfig.firebase.projectId, 1, 1000));
            }

            const results = await Promise.all(promises);
            const wallpapersData = results[0];

            setWallpapers(wallpapersData.data);
            setTotalWallpapers(wallpapersData.total);

            if (results.length > 1) {
                setCategories(results[1].data);
            }
        } catch (error) {
            console.error("Error loading wallpapers:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!wallpaperToDelete || !activeConfig) return;

        try {
            await deleteWallpaper(activeConfig.firebase.projectId, wallpaperToDelete);
            setWallpapers(wallpapers.filter((w) => w.id !== wallpaperToDelete));
            setDeleteDialogOpen(false);
            setWallpaperToDelete(null);
            loadData(); // Reload to keep pagination sync
        } catch (error) {
            console.error("Error deleting wallpaper:", error);
        }
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find((c) => c.id === categoryId)?.name || categoryId;
    };

    // No client-side filtering or slicing needed anymore, server handles it.

    const totalPages = Math.ceil(totalWallpapers / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    if (!activeConfig) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Please select an app to manage wallpapers</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Wallpapers</h1>
                    <p className="text-muted-foreground">Manage your wallpaper collection</p>
                </div>
                <Link href="/wallpapers/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Wallpaper
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or tags..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="15">15 per page</SelectItem>
                        <SelectItem value="30">30 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>
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
                                {wallpapers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No wallpapers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    wallpapers.map((wallpaper) => (
                                        <TableRow key={wallpaper.id}>
                                            <TableCell>
                                                <Image
                                                    src={getListThumbnail(wallpaper.thumbnail_url)}
                                                    alt={wallpaper.title}
                                                    width={64}
                                                    height={64}
                                                    className="h-16 w-16 rounded object-cover"
                                                    unoptimized={getListThumbnail(wallpaper.thumbnail_url).endsWith('.mp4')}
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
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setViewWallpaper(wallpaper)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/wallpapers/${wallpaper.id}/edit`)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setWallpaperToDelete(wallpaper.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Wallpaper</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this wallpaper? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <WallpaperDetailsDialog
                wallpaper={viewWallpaper}
                open={!!viewWallpaper}
                onOpenChange={(open) => !open && setViewWallpaper(null)}
                categories={categories}
            />
        </div>
    );
}
