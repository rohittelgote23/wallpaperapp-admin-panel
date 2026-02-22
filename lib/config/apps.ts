import { AppConfig } from "@/types/app-config";

// Load app configurations from environment variables
export const APP_CONFIGS: AppConfig[] = [
    {
        id: "lumio",
        name: process.env.NEXT_PUBLIC_LUMIO_NAME || "Lumio Walls",
        firebase: {
            apiKey: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_API_KEY || "",
            authDomain: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.NEXT_PUBLIC_LUMIO_FIREBASE_APP_ID || "",
        },
        cloudinary: {
            cloudName: process.env.NEXT_PUBLIC_LUMIO_CLOUDINARY_CLOUD_NAME || "",
            uploadPreset: process.env.NEXT_PUBLIC_LUMIO_CLOUDINARY_UPLOAD_PRESET || "",
            folder: process.env.NEXT_PUBLIC_LUMIO_CLOUDINARY_FOLDER || "",
        },
    },
    {
        id: "bhim",
        name: process.env.NEXT_PUBLIC_BHIM_NAME || "Bhim Walls",
        firebase: {
            apiKey: process.env.NEXT_PUBLIC_BHIM_FIREBASE_API_KEY || "",
            authDomain: process.env.NEXT_PUBLIC_BHIM_FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.NEXT_PUBLIC_BHIM_FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.NEXT_PUBLIC_BHIM_FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.NEXT_PUBLIC_BHIM_FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.NEXT_PUBLIC_BHIM_FIREBASE_APP_ID || "",
        },
        cloudinary: {
            cloudName: process.env.NEXT_PUBLIC_BHIM_CLOUDINARY_CLOUD_NAME || "",
            uploadPreset: process.env.NEXT_PUBLIC_BHIM_CLOUDINARY_UPLOAD_PRESET || "",
            folder: process.env.NEXT_PUBLIC_BHIM_CLOUDINARY_FOLDER || "",
        },
    },
];

// Get app config by ID
export function getAppConfig(appId: string): AppConfig | undefined {
    return APP_CONFIGS.find((app) => app.id === appId);
}

// Get all available apps
export function getAvailableApps() {
    return APP_CONFIGS.filter((app) => app.firebase.apiKey); // Only return configured apps
}
