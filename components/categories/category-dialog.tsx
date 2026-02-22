"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { Category, CategoryFormData } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CloudinaryUpload } from "@/components/wallpapers/cloudinary-upload";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess: () => void;
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: CategoryDialogProps) {
    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        thumbnail: "",
        order: 0,
        isActive: true,
        isVirtual: false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                thumbnail: category.thumbnail,
                order: category.order,
                isActive: category.isActive,
                isVirtual: category.isVirtual,
            });
        } else {
            setFormData({
                name: "",
                thumbnail: "",
                order: 0,
                isActive: true,
                isVirtual: false,
                id: "",
            });
        }
    }, [category, open]);

    const handleSubmit = async () => {
        if (!activeConfig) return;

        // Check if Cloudinary is configured
        if (!activeConfig.cloudinary.cloudName || !activeConfig.cloudinary.uploadPreset) {
            alert("Cloudinary is not configured for this app. Please check your settings.");
            return;
        }

        setLoading(true);
        try {
            if (category) {
                await updateCategory(activeConfig.firebase.projectId, category.id, formData);
            } else {
                await createCategory(activeConfig.firebase.projectId, formData);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent
                className="max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {category ? "Edit Category" : "Create Category"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {!category && (
                        <div>
                            <Label htmlFor="id">Category ID (Optional - Auto-generated if empty)</Label>
                            <Input
                                id="id"
                                value={formData.id || ""}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                placeholder="e.g. nature-wallpapers"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Leave empty to auto-generate. Must be unique.
                            </p>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Thumbnail</Label>
                        <div className="mt-2">
                            <CloudinaryUpload
                                buttonText="Upload Thumbnail"
                                onUploadSuccess={(result) =>
                                    setFormData({ ...formData, thumbnail: result.url })
                                }
                            />
                        </div>
                        {formData.thumbnail && (
                            <img
                                src={formData.thumbnail}
                                alt="Preview"
                                className="mt-2 h-24 w-24 rounded object-cover"
                            />
                        )}
                    </div>

                    <div>
                        <Label htmlFor="order">Order</Label>
                        <Input
                            id="order"
                            type="number"
                            min={0}
                            value={formData.order}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const safeVal = isNaN(val) ? 0 : val;
                                setFormData({ ...formData, order: safeVal < 0 ? 0 : safeVal });
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isActive: checked })
                            }
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isVirtual"
                            checked={formData.isVirtual}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isVirtual: checked })
                            }
                        />
                        <Label htmlFor="isVirtual">Virtual</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : (category ? "Update" : "Create")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
