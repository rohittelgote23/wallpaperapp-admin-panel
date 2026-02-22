import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

interface AdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function getAdminConfig(projectId: string): AdminConfig | null {
    // Helper to process private key
    const processKey = (key?: string) => key?.replace(/\\n/g, "\n");

    // Lumio Walls
    if (projectId === "lumiowalls" || projectId === process.env.NEXT_PUBLIC_LUMIO_FIREBASE_PROJECT_ID) {
        return {
            projectId: process.env.LUMIO_FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID || "",
            clientEmail: process.env.LUMIO_FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
            privateKey: processKey(process.env.LUMIO_FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY) || "",
        };
    }

    // Dhamma Walls (Bhim)
    if (projectId === "dhamma-walls" || projectId === process.env.NEXT_PUBLIC_BHIM_FIREBASE_PROJECT_ID) {
        return {
            projectId: process.env.BHIM_FIREBASE_ADMIN_PROJECT_ID || "",
            clientEmail: process.env.BHIM_FIREBASE_ADMIN_CLIENT_EMAIL || "",
            privateKey: processKey(process.env.BHIM_FIREBASE_ADMIN_PRIVATE_KEY) || "",
        };
    }

    return null;
}

// Return type inference or simple any to avoid namespace clashes between modular and legacy SDKs
export function getFirebaseAdminApp(projectId: string): any {
    const apps = getApps();
    const existingApp = apps.find(app => app.name === projectId);

    if (existingApp) {
        return existingApp;
    }

    const config = getAdminConfig(projectId);

    if (!config || !config.projectId || !config.privateKey || !config.clientEmail) {
        // Fallback or error
        console.warn(`No admin configuration found for project: ${projectId}. Using default initialization if available.`);

        // If we have a default app and it matches, use it? 
        // Or strictly require config. 
        // For backwards compatibility with single-app setup:
        if (apps.length > 0 && apps[0].name === "[DEFAULT]") {
            return apps[0];
        }

        throw new Error(`Firebase Admin configuration missing for project: ${projectId}`);
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
        }),
    }, projectId); // Initialize with unique name (projectId)
}

export const getAdminDb = (projectId: string) => getFirebaseAdminApp(projectId).firestore();
export const getAdminAuth = (projectId: string) => getFirebaseAdminApp(projectId).auth();

// Deprecated: verify usages and remove if possible, or alias to default
// exporting adminDb/adminAuth as checking default app might be risky if multiple exist.
// We'll remove the singleton exports.

