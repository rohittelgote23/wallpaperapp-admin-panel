"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { AppSwitcher } from "@/components/app-switcher";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/app-store";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { User, LogOut, Menu, LayoutDashboard, Image, FolderOpen, Users } from "lucide-react";

const navItems = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Wallpapers", href: "/wallpapers", icon: Image },
    { title: "Categories", href: "/categories", icon: FolderOpen },
    { title: "Users", href: "/users", icon: Users },
];

export function Header() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { getActiveConfig } = useAppStore();
    const currentConfig = getActiveConfig();

    return (
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <div className="flex h-full flex-col">
                        <div className="flex h-14 items-center border-b px-4">
                            <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                                <img
                                    src={currentConfig?.id === "bhim" ? "/dhammawalls.jpg" : "/lumiowalls.jpg"}
                                    alt="Logo"
                                    className="h-8 w-auto object-contain rounded"
                                />
                                <span>{currentConfig?.name || "Lumio Walls"}</span>
                            </Link>
                        </div>
                        <nav className="flex flex-col px-2 py-2 text-sm font-medium gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
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
                </SheetContent>
            </Sheet>
            <div className="flex-1">
                <AppSwitcher />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
