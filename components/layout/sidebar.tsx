"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Image,
    FolderOpen,
    Users,
    Settings,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Wallpapers",
        href: "/wallpapers",
        icon: Image,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: FolderOpen,
    },
    {
        title: "Users",
        href: "/users",
        icon: Users,
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    return (
        <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img
                        src={activeConfig?.id === "bhim" ? "/dhammawalls.jpg" : "/lumiowalls.jpg"}
                        alt="Logo"
                        className="h-8 w-auto object-contain rounded"
                    />
                    <span className="">{activeConfig?.name || "Lumio Walls"}</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-[6px] px-3 py-2 transition-all",
                                    isActive
                                        ? "bg-secondary"
                                        : "hover:bg-accent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
