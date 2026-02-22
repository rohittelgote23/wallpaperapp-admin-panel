"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { getCategories, deleteCategory } from "@/app/actions/categories";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CategoryDialog } from "@/components/categories/category-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalCategories, setTotalCategories] = useState(0);

    const router = useRouter();

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    useEffect(() => {
        loadCategories();
    }, [activeConfig, currentPage, itemsPerPage]);

    async function loadCategories() {
        if (!activeConfig) return;

        setLoading(true);
        try {
            const { data, total } = await getCategories(
                activeConfig.firebase.projectId,
                currentPage,
                itemsPerPage
            );
            setCategories(data);
            setTotalCategories(total);
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setLoading(false);
        }
    }

    const openDialog = (category?: Category) => {
        setCurrentCategory(category || null);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete || !activeConfig) return;

        try {
            await deleteCategory(activeConfig.firebase.projectId, categoryToDelete);
            setCategories(categories.filter((c) => c.id !== categoryToDelete));
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
            loadCategories(); // Reload to adjust pagination if needed
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // When client-side searching, we might have fewer items than total
    // But since we are paginating server-side, search should ideally also be server-side or we accept
    // that search only filters current page.
    // For now, consistent with other pages, we will filter client side on the fetched page.
    // (Note: To search across ALL categories with pagination, we'd need a Firestore search solution)

    const totalPages = Math.ceil(totalCategories / itemsPerPage);

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    if (!activeConfig) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Please select an app to manage categories</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage your wallpaper categories</p>
                </div>
                <Button onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-4"
                        style={{
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        }}>
                        {categories.map((category) => (
                            <Card key={category.id} className="overflow-hidden">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{category.name}</CardTitle>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                {category.isVirtual && (
                                                    <Badge variant="outline">Virtual</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => router.push(`/categories/${category.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openDialog(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setCategoryToDelete(category.id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 space-y-3">
                                    <div className="h-[150px] w-full rounded-lg overflow-hidden border">
                                        <img
                                            src={category.thumbnail}
                                            alt={category.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Wallpapers: {category.wallpaperCount ?? 0}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}

            <CategoryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                category={currentCategory}
                onSuccess={loadCategories}
            />

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
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
        </div>
    );
}
