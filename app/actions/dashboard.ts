"use server";

import { getAdminDb } from "@/lib/firebase/admin";

export async function getDashboardStats(projectId: string) {
    try {
        const db = getAdminDb(projectId);
        const [wallpapersSnap, categoriesSnap] = await Promise.all([
            db.collection("Wallpapers").get(),
            db.collection("Categories").get(),
        ]);

        const wallpapers = wallpapersSnap.docs.map((doc: any) => doc.data());

        const totalDownloads = wallpapers.reduce((sum: any, w: any) => sum + (w.downloads || 0), 0);
        const totalLikes = wallpapers.reduce((sum: any, w: any) => sum + (w.likes || 0), 0);
        const totalViews = wallpapers.reduce((sum: any, w: any) => sum + (w.views || 0), 0);

        return {
            totalWallpapers: wallpapersSnap.size,
            totalCategories: categoriesSnap.size,
            totalDownloads,
            totalLikes,
            totalViews,
        };
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw new Error("Failed to fetch dashboard statistics");
    }
}

export async function getRecentActivity(projectId: string, limit: number = 10) {
    try {
        const db = getAdminDb(projectId);
        const snapshot = await db
            .collection("Wallpapers")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || "Untitled",
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                thumbnail_url: data.thumbnail_url || "",
            };
        });
    } catch (error) {
        console.error("Error getting recent activity:", error);
        throw new Error("Failed to fetch recent activity");
    }
}
