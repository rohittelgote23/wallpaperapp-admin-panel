"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wallpaperSchema, WallpaperInput } from "@/lib/validations/wallpaper";
import { getCategories } from "@/app/actions/categories";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudinaryUpload } from "./cloudinary-upload";
import { ColorPaletteGenerator } from "./color-palette-generator";
import { Wallpaper } from "@/types/wallpaper";
import { Category } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import { BASE_COLORS } from "@/lib/color-palette";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WallpaperFormProps {
    initialData?: Wallpaper;
    onSubmit: (data: WallpaperInput) => Promise<void>;
    submitLabel: string;
}

export function WallpaperForm({ initialData, onSubmit, submitLabel }: WallpaperFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");

    // Determine initial mode based on whether thumbnail matches auto-generated pattern
    const getInitialMode = () => {
        if (!initialData?.thumbnail_url || !initialData.full_url) return "auto";
        // Simple check: if thumbnail is just a transformation of full_url
        const isAuto = initialData.thumbnail_url.includes("c_fill") ||
            (initialData.full_url.includes("/upload/") && initialData.thumbnail_url.includes(initialData.full_url.split("/upload/")[1]));
        return isAuto ? "auto" : "custom";
    };

    const [thumbnailMode, setThumbnailMode] = useState<"auto" | "custom">(getInitialMode());

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<WallpaperInput>({
        resolver: zodResolver(wallpaperSchema),
        defaultValues: initialData || {
            title: "",
            categoryIds: [],
            thumbnail_url: "",
            full_url: "",
            color_palette: [],
            isActive: true,
            isPremium: false,
            tags: [],
            info: "",
        },
    });

    const watchedCategoryIds = watch("categoryIds");
    const watchedTags = watch("tags");
    const watchedFullUrl = watch("full_url");
    const watchedThumbnailUrl = watch("thumbnail_url"); // Watch thumbnail url

    const isVideoUrl = (url: string) => {
        if (!url) return false;
        return url.includes("/video/") || url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
    };

    useEffect(() => {
        async function loadCategories() {
            if (!activeConfig) return;
            const result = await getCategories(activeConfig.firebase.projectId, 1, 1000);
            setCategories(result.data);
        }
        loadCategories();
    }, [activeConfig]);


    const handleFormSubmit = async (data: WallpaperInput) => {
        setLoading(true);
        try {
            await onSubmit(data);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (categoryId: string) => {
        const current = watchedCategoryIds || [];
        const updated = current.includes(categoryId)
            ? current.filter((id) => id !== categoryId)
            : [...current, categoryId];
        setValue("categoryIds", updated);
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        const current = watchedTags || [];
        if (!current.includes(tagInput.trim())) {
            setValue("tags", [...current, tagInput.trim()]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tag: string) => {
        const current = watchedTags || [];
        setValue("tags", current.filter((t) => t !== tag));
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" {...register("title")} />
                        {errors.title && (
                            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="info">Info</Label>
                        <Input id="info" {...register("info")} placeholder="Optional description" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={watch("isActive")}
                            onCheckedChange={(checked) => setValue("isActive", checked)}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isPremium"
                            checked={watch("isPremium")}
                            onCheckedChange={(checked) => setValue("isPremium", checked)}
                        />
                        <Label htmlFor="isPremium">Premium</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Media Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Full Image/Video *</Label>
                        <div className="mt-2">
                            <CloudinaryUpload
                                buttonText="Upload Full Wallpaper"
                                onUploadSuccess={(result) => {
                                    setValue("full_url", result.url);
                                    // If mode is auto, update thumbnail
                                    if (thumbnailMode === "auto") {
                                        setValue("thumbnail_url", result.thumbnail_url);
                                    }
                                }}
                            />
                        </div>
                        {watch("full_url") && (
                            <div className="mt-2">
                                {isVideoUrl(watch("full_url")) ? (
                                    <video
                                        src={watch("full_url")}
                                        className="h-32 w-auto rounded border"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={watch("full_url")}
                                        alt="Preview"
                                        className="h-32 w-auto rounded border"
                                    />
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{watch("full_url")}</p>
                            </div>
                        )}
                        {errors.full_url && (
                            <p className="text-sm text-red-600 mt-1">{errors.full_url.message}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Thumbnail Source</Label>
                        <RadioGroup
                            defaultValue="auto"
                            value={thumbnailMode}
                            onValueChange={(value: string) => {
                                setThumbnailMode(value as "auto" | "custom");
                                if (value === "auto" && watchedFullUrl) {
                                    // Regenerate thumbnail from full URL if switching back to auto
                                    // This is a simple approximation, for perfect regen we might need the original result
                                    // But usually Cloudinary URLs are predictable
                                    if (watchedFullUrl.includes("/upload/")) {
                                        const thumb = watchedFullUrl.includes("/video/")
                                            ? watchedFullUrl.replace("/upload/", "/upload/so_0,c_fit,w_200/").replace(/\.(mp4|webm|mov)$/, ".jpg")
                                            : watchedFullUrl.replace("/upload/", "/upload/c_fit,w_200/");
                                        setValue("thumbnail_url", thumb);
                                    }
                                }
                            }}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auto" id="auto" />
                                <Label htmlFor="auto">Auto-generated from Wallpaper</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="custom" />
                                <Label htmlFor="custom">Upload Custom Thumbnail</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {thumbnailMode === "custom" && (
                        <div>
                            <Label>Custom Thumbnail</Label>
                            <div className="mt-2">
                                <CloudinaryUpload
                                    buttonText="Upload Custom Thumbnail"
                                    onUploadSuccess={(result) => setValue("thumbnail_url", result.url)}
                                />
                            </div>
                        </div>
                    )}

                    {watch("thumbnail_url") && (
                        <div className="mt-2">
                            <Label>Current Thumbnail</Label>
                            <div className="mt-2">
                                <img
                                    src={watch("thumbnail_url")}
                                    alt="Thumbnail Preview"
                                    className="h-24 w-24 rounded border object-cover"
                                />
                            </div>
                        </div>
                    )}
                    {errors.thumbnail_url && (
                        <p className="text-sm text-red-600 mt-1">{errors.thumbnail_url.message}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Color Palette *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ColorPaletteGenerator
                        imageUrl={isVideoUrl(watchedFullUrl) ? watchedThumbnailUrl : watchedFullUrl}
                        onPaletteGenerated={(colors) => setValue("color_palette", colors)}
                    />

                    <div className="space-y-3 mt-4">
                        <Label>Selected Colors (max 5)</Label>
                        <div className="flex gap-3 flex-wrap">
                            {BASE_COLORS.map((baseColor) => {
                                const current = watch("color_palette") || [];
                                const isSelected = current.includes(baseColor.name);
                                const isWhiteish = ["white", "yellow", "sand", "pink", "peach", "light blue", "cyan"].includes(baseColor.name);

                                return (
                                    <button
                                        type="button"
                                        key={baseColor.name}
                                        onClick={() => {
                                            if (isSelected) {
                                                setValue("color_palette", current.filter((c) => c !== baseColor.name));
                                            } else {
                                                if (current.length < 5) {
                                                    setValue("color_palette", [...current, baseColor.name]);
                                                }
                                            }
                                        }}
                                        className={`group relative h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all ${isSelected
                                                ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-md border-transparent"
                                                : "border border-gray-300 hover:scale-105 hover:shadow-sm"
                                            }`}
                                        style={{ backgroundColor: baseColor.hex }}
                                        title={baseColor.name}
                                    >
                                        {isSelected && (
                                            <Check className={`h-5 w-5 md:h-6 md:w-6 ${isWhiteish ? "text-slate-800" : "text-white"}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {errors.color_palette && (
                        <p className="text-sm text-red-600">{errors.color_palette.message}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Categories *</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <Badge
                                key={cat.id}
                                variant="outline"
                                className={`cursor-pointer transition-all ${watchedCategoryIds?.includes(cat.id)
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                                    : "bg-white text-secondary-foreground hover:bg-gray-100 border-gray-200"
                                    }`}
                                onClick={() => handleCategoryToggle(cat.id)}
                            >
                                {cat.name}
                            </Badge>
                        ))}
                    </div>
                    {errors.categoryIds && (
                        <p className="text-sm text-red-600 mt-2">{errors.categoryIds.message}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                        />
                        <Button type="button" onClick={handleAddTag}>Add</Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(watchedTags || []).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-foreground text-primary-foreground">
                                {tag}
                                <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                />
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Saving..." : submitLabel}
            </Button>
        </form>
    );
}
