import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Convert a Cloudinary URL to a small list thumbnail using c_thumb,w_100,g_center.
 * Falls back to the original URL if not a valid Cloudinary URL.
 */
export function getListThumbnail(url: string): string {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(/\/upload\/([^/]*?)\//, "/upload/c_thumb,w_100,g_center/");
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
