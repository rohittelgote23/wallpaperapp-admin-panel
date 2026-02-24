import { CloudinaryConfig } from "@/types/app-config";

declare global {
    interface Window {
        cloudinary: any;
    }
}

let currentConfig: CloudinaryConfig | null = null;

export function setCloudinaryConfig(config: CloudinaryConfig) {
    currentConfig = config;
}

export function getCloudinaryConfig(): CloudinaryConfig {
    if (!currentConfig) {
        throw new Error("Cloudinary not configured. Please select an app first.");
    }
    return currentConfig;
}

export interface CloudinaryUploadResult {
    url: string;
    thumbnail_url: string;
    public_id: string;
    format: string;
    resource_type: string;
}

export function openCloudinaryWidget(
    onSuccess: (result: CloudinaryUploadResult) => void,
    onError?: (error: any) => void
): void {
    try {
        const config = getCloudinaryConfig();
        console.log("Cloudinary config:", { cloudName: config.cloudName, uploadPreset: config.uploadPreset, folder: config.folder });

        if (!window.cloudinary) {
            console.error("Cloudinary widget not loaded");
            if (onError) onError(new Error("Cloudinary widget not loaded"));
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: config.cloudName,
                uploadPreset: config.uploadPreset,
                folder: config.folder,
                sources: ["local", "url", "camera"],
                resourceType: "auto", // Supports images, videos, and GIFs
                maxFileSize: 100000000, // 100MB
                clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "webm", "mov"],
                multiple: false,
                cropping: false,
            },
            (error: any, result: any) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    if (onError) onError(error);
                    return;
                }

                if (result.event === "success") {
                    const uploadedFile = result.info;

                    // Generate thumbnail URL for images and videos
                    let thumbnailUrl = uploadedFile.secure_url;
                    if (uploadedFile.resource_type === "image") {
                        thumbnailUrl = uploadedFile.secure_url.replace(
                            "/upload/",
                            "/upload/c_limit,w_700,dpr_auto,q_auto:best/"
                        );
                    } else if (uploadedFile.resource_type === "video") {
                        // For videos, get a thumbnail
                        thumbnailUrl = uploadedFile.secure_url
                            .replace("/upload/", "/upload/so_0,w_700,q_auto:best/")
                            .replace(/\.(mp4|webm|mov)$/, ".jpg");
                    }

                    onSuccess({
                        url: uploadedFile.secure_url,
                        thumbnail_url: thumbnailUrl,
                        public_id: uploadedFile.public_id,
                        format: uploadedFile.format,
                        resource_type: uploadedFile.resource_type,
                    });

                    // widget.close();
                }
            }
        );

        widget.open();
    } catch (error) {
        console.error("Error launching Cloudinary widget:", error);
        if (onError) onError(error);
    }
}
