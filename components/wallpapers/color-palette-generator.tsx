"use client";

import { useState } from "react";
import { extractColorPalette } from "@/lib/color-palette";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPaletteGeneratorProps {
    imageUrl: string;
    onPaletteGenerated: (colors: string[]) => void;
}

export function ColorPaletteGenerator({ imageUrl, onPaletteGenerated }: ColorPaletteGeneratorProps) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!imageUrl) return;

        setLoading(true);
        try {
            const palette = await extractColorPalette(imageUrl, 5);
            onPaletteGenerated(palette);
        } catch (error) {
            console.error("Error generating palette:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={!imageUrl || loading}
            >
                <Palette className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Color Palette"}
            </Button>
        </div>
    );
}
