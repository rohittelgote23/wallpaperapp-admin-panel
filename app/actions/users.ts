"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { AppUser } from "@/types/user";

export async function getUsers(
    projectId: string,
    page: number = 1,
    limit: number = 15,
    search?: string
): Promise<{ data: AppUser[]; total: number }> {
    try {
        const db = getAdminDb(projectId);
        const usersCollection = db.collection("users");

        // If searching, fetch all and filter client-side (Firestore limitation for email search)
        if (search) {
            const snapshot = await usersCollection.get();
            const allUsers = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email || "",
                    favorites: data.favorites || [],
                    role: data.role,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
                    subscription: data.subscription ? {
                        isPremium: data.subscription.isPremium ?? false,
                        activeEntitlement: data.subscription.activeEntitlement || null,
                        lastUpdated: data.subscription.lastUpdated?.toDate?.()?.toISOString() || data.subscription.lastUpdated || null
                    } : undefined,
                };
            }) as AppUser[];

            const searchLower = search.toLowerCase();
            const filtered = allUsers.filter(user =>
                user.email.toLowerCase().includes(searchLower) ||
                (user.displayName && user.displayName.toLowerCase().includes(searchLower))
            );

            const total = filtered.length;
            const startIndex = (page - 1) * limit;
            const data = filtered.slice(startIndex, startIndex + limit);

            return { data, total };
        } else {
            // No search, efficient pagination
            const countSnapshot = await usersCollection.count().get();
            const total = countSnapshot.data().count;

            const snapshot = await usersCollection
                .limit(limit)
                .offset((page - 1) * limit)
                .get();

            const data = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email || "",
                    favorites: data.favorites || [],
                    role: data.role,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
                    subscription: data.subscription ? {
                        isPremium: data.subscription.isPremium ?? false,
                        activeEntitlement: data.subscription.activeEntitlement || null,
                        lastUpdated: data.subscription.lastUpdated?.toDate?.()?.toISOString() || data.subscription.lastUpdated || null
                    } : undefined,
                };
            }) as AppUser[];

            return { data, total };
        }
    } catch (error) {
        console.error("Error getting users:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function getUser(
    projectId: string,
    userId: string
): Promise<AppUser | null> {
    try {
        const db = getAdminDb(projectId);
        const doc = await db
            .collection("users")
            .doc(userId)
            .get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        if (!data) return null;

        return {
            id: doc.id,
            email: data.email || "",
            favorites: data.favorites || [],
            role: data.role,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
            subscription: data.subscription ? {
                isPremium: data.subscription.isPremium ?? false,
                activeEntitlement: data.subscription.activeEntitlement || null,
                lastUpdated: data.subscription.lastUpdated?.toDate?.()?.toISOString() || data.subscription.lastUpdated || null
            } : undefined,
        } as AppUser;
    } catch (error) {
        console.error("Error getting user:", error);
        throw new Error("Failed to fetch user");
    }
}
