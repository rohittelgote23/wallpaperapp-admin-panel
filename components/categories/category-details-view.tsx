"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getCategory } from "@/app/actions/categories";
import { getWallpapers, deleteWallpaper } from "@/app/actions/wallpapers";
import { Category } from "@/types/category";
import { Wallpaper } from "@/types/wallpaper";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Pencil, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { WallpaperDetailsDialog } from "@/components/wallpapers/wallpaper-details-dialog";
import { formatDate, getListThumbnail } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface CategoryDetailsViewProps {
    categoryId: string;
}

export default function CategoryDetailsView({ categoryId }: CategoryDetailsViewProps) {
    const router = useRouter();
    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    const [category, setCategory] = useState<Category | null>(null);
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalWallpapers, setTotalWallpapers] = useState(0);

    // Wallpaper actions state
    const [wallpaperToDelete, setWallpaperToDelete] = useState<string | null>(null);
    const [deleteWallpaperDialogOpen, setDeleteWallpaperDialogOpen] = useState(false);
    const [viewWallpaper, setViewWallpaper] = useState<Wallpaper | null>(null);

    const totalPages = Math.ceil(totalWallpapers / itemsPerPage);

    useEffect(() => {
        loadData();
    }, [activeConfig, categoryId, currentPage, itemsPerPage]);

    async function loadData() {
        if (!activeConfig) return;

        setLoading(true);
        try {
            const [categoryData, wallpapersData] = await Promise.all([
                getCategory(activeConfig.firebase.projectId, categoryId),
                getWallpapers(activeConfig.firebase.projectId, {
                    categoryId,
                    page: currentPage,
                    limit: itemsPerPage,
                }),
            ]);
            setCategory(categoryData);
            setWallpapers(wallpapersData.data);
            setTotalWallpapers(wallpapersData.total);
        } catch (error) {
            console.error("Error loading category details:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleDeleteWallpaper = async () => {
        if (!wallpaperToDelete || !activeConfig) return;

        try {
            await deleteWallpaper(activeConfig.firebase.projectId, wallpaperToDelete);
            setDeleteWallpaperDialogOpen(false);
            setWallpaperToDelete(null);
            loadData(); // Reload to keep pagination in sync
        } catch (error) {
            console.error("Error deleting wallpaper:", error);
        }
    };

    if (!activeConfig) return null;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-48 w-full" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <h2 className="text-xl font-semibold">Category not found</h2>
                <Button onClick={() => router.push("/categories")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/categories")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{category.name}</h1>
                    <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Category Info Card */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full aspect-video object-cover rounded-lg border"
                    />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">ID</span>
                            <p className="font-mono text-sm">{category.id}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <div className="flex gap-2">
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                    {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {category.isVirtual && <Badge variant="outline">Virtual</Badge>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Order</span>
                            <p>{category.order}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Created</span>
                            <p>{formatDate(category.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallpapers List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Wallpapers ({totalWallpapers})</h2>
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
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Preview</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wallpapers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        No wallpapers found in this category
                                    </TableCell>
                                </TableRow>
                            ) : (
                                wallpapers.map((wallpaper) => (
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
                                                        setDeleteWallpaperDialogOpen(true);
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

            <CategoryDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                category={category}
                onSuccess={() => {
                    loadData();
                    setEditDialogOpen(false);
                }}
            />

            <Dialog open={deleteWallpaperDialogOpen} onOpenChange={setDeleteWallpaperDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Wallpaper</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this wallpaper? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteWallpaperDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteWallpaper}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <WallpaperDetailsDialog
                wallpaper={viewWallpaper}
                open={!!viewWallpaper}
                onOpenChange={(open) => !open && setViewWallpaper(null)}
                categories={[category]} // Pass single category here as context
            />
        </div>
    );
}
