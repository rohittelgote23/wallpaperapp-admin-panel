import { useAppStore } from "@/store/app-store";
import { getAppConfig } from "@/lib/config/apps";

/**
 * Hook to get the active app configuration
 * Returns null if no app is selected or app not found
 */
export function useActiveApp() {
    const { activeAppId } = useAppStore();

    if (!activeAppId) {
        return null;
    }

    return getAppConfig(activeAppId);
}
