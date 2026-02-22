"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, FolderOpen, Download, Heart, Eye } from "lucide-react";
import { formatNumber, formatDate, getListThumbnail } from "@/lib/utils";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { getActiveConfig } = useAppStore();
    const activeConfig = getActiveConfig();

    useEffect(() => {
        async function fetchData() {
            if (!activeConfig) return;

            setLoading(true);
            try {
                const [statsData, activityData] = await Promise.all([
                    getDashboardStats(activeConfig.firebase.projectId),
                    getRecentActivity(activeConfig.firebase.projectId, 10),
                ]);

                setStats(statsData);
                setRecentActivity(activityData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [activeConfig]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!activeConfig) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">No App Selected</h2>
                    <p className="text-muted-foreground mt-2">
                        Please configure an app in Settings to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of {activeConfig.name} wallpaper app
                </p>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Wallpapers</CardTitle>
                        <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalWallpapers || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalCategories || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalDownloads || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Likes</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalLikes || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats?.totalViews || 0)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                        ) : (
                            recentActivity.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={getListThumbnail(item.thumbnail_url)}
                                        alt={item.title}
                                        className="h-12 w-12 rounded object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
