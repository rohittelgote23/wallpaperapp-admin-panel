export interface Category {
    id: string;
    name: string;
    thumbnail: string;
    order: number;
    isActive: boolean;
    isVirtual: boolean;
    createdAt: string;
    wallpaperCount?: number;
}

export interface CategoryFormData {
    id?: string;
    name: string;
    thumbnail: string;
    order: number;
    isActive: boolean;
    isVirtual: boolean;
}
