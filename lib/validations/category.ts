import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    thumbnail: z.string().url("Invalid thumbnail URL"),
    order: z.number().int().min(0, "Order must be positive"),
    isActive: z.boolean().default(true),
    isVirtual: z.boolean().default(false),
});

export type CategoryInput = z.infer<typeof categorySchema>;
