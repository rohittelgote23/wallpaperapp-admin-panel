"use client";

import { useAppStore } from "@/store/app-store";
import { getAvailableApps, getAppConfig } from "@/lib/config/apps";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { setCloudinaryConfig } from "@/lib/cloudinary/config";

export function AppSwitcher() {
    const { activeAppId, setActiveApp } = useAppStore();
    const availableApps = getAvailableApps();
    const activeConfig = activeAppId ? getAppConfig(activeAppId) : null;

    const handleAppChange = (appId: string) => {
        setActiveApp(appId);
        const config = getAppConfig(appId);

        if (config) {
            // Only update Cloudinary config, keep Firebase Auth (SSO) as is
            try {
                setCloudinaryConfig(config.cloudinary);
            } catch (error) {
                console.error("Error switching app:", error);
            }
        }
    };

    if (availableApps.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No apps configured
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    {activeConfig?.name || "Select App"}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch App</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableApps.map((app) => (
                    <DropdownMenuItem
                        key={app.id}
                        onClick={() => handleAppChange(app.id)}
                        className={activeAppId === app.id ? "bg-accent" : ""}
                    >
                        {app.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
