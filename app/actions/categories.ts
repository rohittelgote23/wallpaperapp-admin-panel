"use server";

import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { Category, CategoryFormData } from "@/types/category";

export async function getCategories(
    projectId: string,
    page: number = 1,
    limit: number = 15
): Promise<{ data: Category[]; total: number }> {
    try {
        const db = getAdminDb(projectId);
        const categoriesCollection = db.collection("Categories");

        // Get total count
        const countSnapshot = await categoriesCollection.count().get();
        const total = countSnapshot.data().count;

        // Get paginated data
        const snapshot = await categoriesCollection
            .orderBy("order", "asc")
            .limit(limit)
            .offset((page - 1) * limit)
            .get();

        const data = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || "",
                thumbnail: data.thumbnail || "",
                order: data.order || 0,
                isActive: data.isActive ?? true,
                isVirtual: data.isVirtual ?? false,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
        }) as Category[];

        // Compute wallpaper counts in parallel
        const wallpapersCollection = db.collection("Wallpapers");
        const countPromises = data.map(async (cat) => {
            const countSnap = await wallpapersCollection
                .where("categoryIds", "array-contains", cat.id)
                .count()
                .get();
            cat.wallpaperCount = countSnap.data().count;
        });
        await Promise.all(countPromises);

        return { data, total };
    } catch (error) {
        console.error("Error getting categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

export async function getCategory(
    projectId: string,
    categoryId: string
): Promise<Category | null> {
    try {
        const db = getAdminDb(projectId);
        const doc = await db
            .collection("Categories")
            .doc(categoryId)
            .get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        if (!data) return null;

        return {
            id: doc.id,
            name: data.name || "",
            thumbnail: data.thumbnail || "",
            order: data.order || 0,
            isActive: data.isActive ?? true,
            isVirtual: data.isVirtual ?? false,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Category;
    } catch (error) {
        console.error("Error getting category:", error);
        throw new Error("Failed to fetch category");
    }
}

export async function createCategory(
    projectId: string,
    data: CategoryFormData
): Promise<string> {
    try {
        const categoryData = {
            ...data,
            createdAt: admin.firestore.Timestamp.now(),
        };

        // Remove id from data to avoid saving it as a field
        delete (categoryData as any).id;

        const db = getAdminDb(projectId);
        if (data.id) {
            await db
                .collection("Categories")
                .doc(data.id)
                .set(categoryData);
            return data.id;
        } else {
            const docRef = await db
                .collection("Categories")
                .add(categoryData);
            return docRef.id;
        }
    } catch (error) {
        console.error("Error creating category:", error);
        throw new Error("Failed to create category");
    }
}

export async function updateCategory(
    projectId: string,
    categoryId: string,
    data: Partial<CategoryFormData>
): Promise<void> {
    try {
        const db = getAdminDb(projectId);
        await db
            .collection("Categories")
            .doc(categoryId)
            .update(data);
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error("Failed to update category");
    }
}

export async function deleteCategory(
    projectId: string,
    categoryId: string
): Promise<void> {
    try {
        const db = getAdminDb(projectId);
        await db
            .collection("Categories")
            .doc(categoryId)
            .delete();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Failed to delete category");
    }
}

export async function updateCategoryOrder(
    projectId: string,
    orderedCategoryIds: { id: string; order: number }[]
): Promise<void> {
    try {
        const db = getAdminDb(projectId);
        const batch = db.batch();

        orderedCategoryIds.forEach(({ id, order }) => {
            const ref = db
                .collection("Categories")
                .doc(id);
            batch.update(ref, { order });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error updating category order:", error);
        throw new Error("Failed to update category order");
    }
}
