"use server";

import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { Wallpaper, WallpaperFormData } from "@/types/wallpaper";

export async function getWallpapers(projectId: string, filters?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}): Promise<{ data: Wallpaper[]; total: number }> {
    try {
        const db = getAdminDb(projectId);
        let query = db.collection("Wallpapers");

        if (filters?.categoryId) {
            query = query.where("categoryIds", "array-contains", filters.categoryId) as any;
        }

        if (filters?.isActive !== undefined) {
            query = query.where("isActive", "==", filters.isActive) as any;
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 15;

        // If searching, we must fetch all matching documents first because Firestore 
        // doesn't support full-text search. Then we paginate client-side.
        if (filters?.search) {
            const snapshot = await query.get();
            let allWallpapers = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || "",
                    categoryIds: data.categoryIds || [],
                    thumbnail_url: data.thumbnail_url || "",
                    full_url: data.full_url || "",
                    color_palette: data.color_palette || [],
                    isActive: data.isActive ?? true,
                    isPremium: data.isPremium ?? false,
                    downloads: data.downloads || 0,
                    likes: data.likes || 0,
                    views: data.views || 0,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    tags: data.tags || [],
                    info: data.info || "",
                };
            }) as Wallpaper[];

            // Sort by createdAt descending
            allWallpapers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const searchLower = filters.search.toLowerCase();
            const filtered = allWallpapers.filter(
                (w) =>
                    w.title.toLowerCase().includes(searchLower) ||
                    w.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            );

            const total = filtered.length;
            const startIndex = (page - 1) * limit;
            const data = filtered.slice(startIndex, startIndex + limit);

            return { data, total };
        } else {
            // No search, use efficient Firestore pagination
            const countSnapshot = await query.count().get();
            const total = countSnapshot.data().count;

            // Note: Ordering by createdAt might require an index if filtering by category/isActive too.
            // We'll try to order, but if it fails, we might need composite indexes.
            // For now, let's keep it simple and just fetch limit/offset.

            // To properly sort, we need: query.orderBy("createdAt", "desc")
            // But if we have other where clauses, we need composite indexes.
            // We'll assume for "All Wallpapers" (no filters), we can sort.

            if (!filters?.categoryId && filters?.isActive === undefined) {
                query = query.orderBy("createdAt", "desc") as any;
            }

            const snapshot = await query.limit(limit).offset((page - 1) * limit).get();

            const data = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || "",
                    categoryIds: data.categoryIds || [],
                    thumbnail_url: data.thumbnail_url || "",
                    full_url: data.full_url || "",
                    color_palette: data.color_palette || [],
                    isActive: data.isActive ?? true,
                    isPremium: data.isPremium ?? false,
                    downloads: data.downloads || 0,
                    likes: data.likes || 0,
                    views: data.views || 0,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    tags: data.tags || [],
                    info: data.info || "",
                };
            }) as Wallpaper[];

            // If we couldn't sort in query (due to composite index issues), sort here 
            // naturally results won't be globally sorted if paginated, but better than error.
            if (filters?.categoryId || filters?.isActive !== undefined) {
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }

            return { data, total };
        }
    } catch (error) {
        console.error("Error getting wallpapers:", error);
        throw new Error("Failed to fetch wallpapers");
    }
}

export async function getWallpaper(
    projectId: string,
    wallpaperId: string
): Promise<Wallpaper | null> {
    try {
        const db = getAdminDb(projectId);
        const doc = await db
            .collection("Wallpapers")
            .doc(wallpaperId)
            .get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        if (!data) return null;

        return {
            id: doc.id,
            title: data.title || "",
            categoryIds: data.categoryIds || [],
            thumbnail_url: data.thumbnail_url || "",
            full_url: data.full_url || "",
            color_palette: data.color_palette || [],
            isActive: data.isActive ?? true,
            isPremium: data.isPremium ?? false,
            downloads: data.downloads || 0,
            likes: data.likes || 0,
            views: data.views || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            tags: data.tags || [],
            info: data.info || "",
        } as Wallpaper;
    } catch (error) {
        console.error("Error getting wallpaper:", error);
        throw new Error("Failed to fetch wallpaper");
    }
}

export async function createWallpaper(
    projectId: string,
    data: WallpaperFormData
): Promise<string> {
    try {
        const wallpaperData = {
            ...data,
            downloads: 0,
            likes: 0,
            views: 0,
            createdAt: admin.firestore.Timestamp.now(),
        };

        const db = getAdminDb(projectId);
        const docRef = await db
            .collection("Wallpapers")
            .add(wallpaperData);

        return docRef.id;
    } catch (error) {
        console.error("Error creating wallpaper:", error);
        throw new Error("Failed to create wallpaper");
    }
}

export async function updateWallpaper(
    projectId: string,
    wallpaperId: string,
    data: Partial<WallpaperFormData>
): Promise<void> {
    try {
        const db = getAdminDb(projectId);
        await db
            .collection("Wallpapers")
            .doc(wallpaperId)
            .update(data);
    } catch (error) {
        console.error("Error updating wallpaper:", error);
        throw new Error("Failed to update wallpaper");
    }
}

export async function deleteWallpaper(
    projectId: string,
    wallpaperId: string
): Promise<void> {
    try {
        const db = getAdminDb(projectId);
        await db
            .collection("Wallpapers")
            .doc(wallpaperId)
            .delete();
    } catch (error) {
        console.error("Error deleting wallpaper:", error);
        throw new Error("Failed to delete wallpaper");
    }
}

export async function getWallpapersByIds(projectId: string, ids: string[]): Promise<Wallpaper[]> {
    if (!ids || ids.length === 0) return [];

    try {
        // Firestore 'in' query supports up to 30 items
        // We will batch if needed. For now simple chunking.
        const chunks = [];
        for (let i = 0; i < ids.length; i += 30) {
            chunks.push(ids.slice(i, i + 30));
        }

        const db = getAdminDb(projectId);
        const promises = chunks.map(chunk =>
            db.collection("Wallpapers")
                .where(admin.firestore.FieldPath.documentId(), "in", chunk)
                .get()
        );

        const snapshots = await Promise.all(promises);
        const wallpapers: Wallpaper[] = [];

        snapshots.forEach((snapshot: any) => {
            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                wallpapers.push({
                    id: doc.id,
                    title: data.title || "",
                    categoryIds: data.categoryIds || [],
                    thumbnail_url: data.thumbnail_url || "",
                    full_url: data.full_url || "",
                    color_palette: data.color_palette || [],
                    isActive: data.isActive ?? true,
                    isPremium: data.isPremium ?? false,
                    downloads: data.downloads || 0,
                    likes: data.likes || 0,
                    views: data.views || 0,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    tags: data.tags || [],
                    info: data.info || "",
                } as Wallpaper);
            });
        });

        return wallpapers;
    } catch (error) {
        console.error("Error getting users favorites:", error);
        return [];
    }
}
