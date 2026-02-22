"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getUsers } from "@/app/actions/users";
import { AppUser } from "@/types/user";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Wallpaper } from "@/types/wallpaper";
import { getWallpapersByIds } from "@/app/actions/wallpapers";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function UsersView() {
    const router = useRouter();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [favorites, setFavorites] = useState<Wallpaper[]>([]);
    const [missingIds, setMissingIds] = useState<string[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalUsers, setTotalUsers] = useState(0);

    const handleViewFavorites = async (user: AppUser) => {
        // ... (existing logic) ...
        // Note: For brevity, keeping existing logic, assumes router push to favorites page
        router.push(`/users/${user.id}/favorites`);
    };

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    useEffect(() => {
        loadUsers();
    }, [activeConfig, currentPage, itemsPerPage, searchTerm]); // Search triggers reload

    async function loadUsers() {
        if (!activeConfig) return;

        setLoading(true);
        try {
            const { data, total } = await getUsers(
                activeConfig.firebase.projectId,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            );
            setUsers(data);
            setTotalUsers(total);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    }

    // No client-side filtering needed

    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    if (!activeConfig) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Please select an app to view users</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">View all app users</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="15">15 per page</SelectItem>
                        <SelectItem value="30">30 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Favorites</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Subscription</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                                                        <AvatarFallback>{(user.displayName || user.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.displayName || "N/A"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.favorites?.length || 0}
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLogin ? formatDate(user.lastLogin) : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {user.subscription?.isPremium ? (
                                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Premium</Badge>
                                                ) : (
                                                    <Badge variant="outline">Free</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/users/${user.id}`)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            )}


        </div>
    );
}
