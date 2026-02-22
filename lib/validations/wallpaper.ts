import { z } from "zod";

export const wallpaperSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    categoryIds: z.array(z.string()).min(1, "At least one category is required"),
    thumbnail_url: z.string().url("Invalid thumbnail URL"),
    full_url: z.string().url("Invalid image/video URL"),
    color_palette: z.array(z.string()).min(1, "At least 1 colors required").max(5),
    isActive: z.boolean(),
    isPremium: z.boolean(),
    tags: z.array(z.string()),
    info: z.string(),
});

export type WallpaperInput = z.infer<typeof wallpaperSchema>;
