import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { FirebaseConfig } from "@/types/app-config";

let currentApp: FirebaseApp | null = null;
let currentAuth: Auth | null = null;
let currentFirestore: Firestore | null = null;

export function initializeFirebase(config: FirebaseConfig) {
    try {
        // Delete existing app if it exists
        if (currentApp) {
            // We'll reinitialize with new config
            const apps = getApps();
            if (apps.length > 0) {
                // Just get the existing app instead of deleting
                currentApp = getApp();
            }
        }

        // Initialize new app
        if (getApps().length === 0) {
            currentApp = initializeApp(config);
        } else {
            currentApp = getApp();
        }

        currentAuth = getAuth(currentApp);
        currentFirestore = getFirestore(currentApp);

        return {
            app: currentApp,
            auth: currentAuth,
            firestore: currentFirestore,
        };
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw error;
    }
}

export function getFirebaseInstances() {
    if (!currentApp || !currentAuth || !currentFirestore) {
        throw new Error("Firebase not initialized. Please select an app first.");
    }

    return {
        app: currentApp,
        auth: currentAuth,
        firestore: currentFirestore,
    };
}
