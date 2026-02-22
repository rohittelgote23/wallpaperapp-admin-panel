"use client";

import { useState } from "react";
import { extractColorPalette, BASE_COLORS } from "@/lib/color-palette";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPaletteGeneratorProps {
    imageUrl: string;
    onPaletteGenerated: (colors: string[]) => void;
}

export function ColorPaletteGenerator({ imageUrl, onPaletteGenerated }: ColorPaletteGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [colors, setColors] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!imageUrl) return;

        setLoading(true);
        try {
            const palette = await extractColorPalette(imageUrl, 5);
            setColors(palette);
            onPaletteGenerated(palette);
        } catch (error) {
            console.error("Error generating palette:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={!imageUrl || loading}
            >
                <Palette className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Color Palette"}
            </Button>

            {colors.length > 0 && (
                <div className="flex gap-2">
                    {colors.map((colorName, index) => {
                        const hex = BASE_COLORS.find(c => c.name === colorName)?.hex || "#CCCCCC";
                        return (
                            <div
                                key={index}
                                className="h-10 w-10 rounded border-2 border-gray-300"
                                style={{ backgroundColor: hex }}
                                title={colorName}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
