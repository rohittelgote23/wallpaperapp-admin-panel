import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAppConfig } from "@/lib/config/apps";
import { AppConfig } from "@/types/app-config";

interface CurrentUser {
    uid: string;
    email: string;
    role: string;
}

interface AppStore {
    activeAppId: string | null;
    currentUser: CurrentUser | null;
    hasHydrated: boolean;
    setActiveApp: (appId: string) => void;
    setCurrentUser: (user: CurrentUser | null) => void;
    getActiveConfig: () => AppConfig | null;
    setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            activeAppId: null,
            currentUser: null,
            hasHydrated: false,

            setActiveApp: (appId: string) => {
                set({ activeAppId: appId });
            },

            setCurrentUser: (user) => {
                set({ currentUser: user });
            },

            getActiveConfig: () => {
                const { activeAppId } = get();
                if (!activeAppId) return null;
                return getAppConfig(activeAppId) || null;
            },

            setHasHydrated: (state) => {
                set({ hasHydrated: state });
            },
        }),
        {
            name: "admin-app-storage",
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
