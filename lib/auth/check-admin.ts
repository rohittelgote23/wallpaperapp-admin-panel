"use server";

import { getAdminDb } from "@/lib/firebase/admin";

export async function checkAdminRole(projectId: string, uid: string): Promise<boolean> {
    try {
        const adminDb = getAdminDb(projectId);
        const adminDoc = await adminDb.collection("admin_users").doc(uid).get();
        return adminDoc.exists;
    } catch (error) {
        console.error("Error checking admin role:", error);
        return false;
    }
}
