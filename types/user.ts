export interface AppUser {
    id: string;
    email: string;
    createdAt?: string;
    lastLogin?: string; // Add lastLogin
    favorites: string[];
    role?: string;
    displayName?: string; // Add displayName while we're at it
    photoURL?: string;
    subscription?: UserSubscription;
}

export interface UserSubscription {
    isPremium: boolean;
    activeEntitlement: "weekly" | "monthly" | string | null; // Keeping string for fallback safety, but prioritizing known values
    lastUpdated: string | null;
}

export interface AdminUser {
    uid: string;
    email: string;
    role: string;
}
