export interface Wallpaper {
  id: string;
  title: string;
  categoryIds: string[];
  thumbnail_url: string;
  full_url: string;
  color_palette: string[];
  isActive: boolean;
  downloads: number;
  likes: number;
  views: number;
  createdAt: string;
  tags: string[];
  isPremium: boolean;
  info: string;
}

export interface WallpaperFormData {
  title: string;
  categoryIds: string[];
  thumbnail_url: string;
  full_url: string;
  color_palette: string[];
  isActive: boolean;
  isPremium: boolean;
  tags: string[];
  info: string;
}
