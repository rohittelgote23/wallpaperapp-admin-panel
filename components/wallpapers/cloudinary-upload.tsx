"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { openCloudinaryWidget, CloudinaryUploadResult } from "@/lib/cloudinary/config";
import { Upload } from "lucide-react";

interface CloudinaryUploadProps {
    onUploadSuccess: (result: CloudinaryUploadResult) => void;
    buttonText?: string;
}

export function CloudinaryUpload({ onUploadSuccess, buttonText = "Upload from Cloudinary" }: CloudinaryUploadProps) {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://upload-widget.cloudinary.com/global/all.js"]');

        if (existingScript) {
            setScriptLoaded(true);
            return;
        }

        // Load Cloudinary widget script
        const script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        script.onload = () => {
            console.log("Cloudinary widget script loaded successfully");
            setScriptLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load Cloudinary widget script");
        };
        document.body.appendChild(script);

        return () => {
            // Don't remove the script anymore to avoid reloading issues
        };
    }, []);

    const handleUpload = () => {
        if (!scriptLoaded) {
            alert("Cloudinary widget is still loading. Please wait a moment and try again.");
            return;
        }

        setLoading(true);
        try {
            openCloudinaryWidget(
                (result) => {
                    onUploadSuccess(result);
                    setLoading(false);
                },
                (error) => {
                    console.error("Upload error:", error);
                    alert(`Upload failed: ${error.message || "Unknown error"}`);
                    setLoading(false);
                }
            );
        } catch (error: any) {
            console.error("Widget error:", error);
            alert(`Widget error: ${error.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    return (
        <Button type="button" variant="outline" onClick={handleUpload} disabled={loading || !scriptLoaded}>
            <Upload className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : !scriptLoaded ? "Loading Widget..." : buttonText}
        </Button>
    );
}
