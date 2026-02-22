/**
 * Extracts a color palette from an image URL using Canvas API
 * @param imageUrl - URL of the image
 * @param colorCount - Number of colors to extract (default: 5)
 * @returns Array of color names mapped to nearest base colors
 */
export async function extractColorPalette(
    imageUrl: string,
    colorCount: number = 5
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Resize for performance
                const scaleFactor = 100 / Math.max(img.width, img.height);
                canvas.width = img.width * scaleFactor;
                canvas.height = img.height * scaleFactor;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                // Sample pixels (every 10th pixel for performance)
                const colorMap = new Map<string, number>();

                for (let i = 0; i < pixels.length; i += 40) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    // Skip transparent pixels
                    if (a < 125) continue;

                    // Round to nearest 10 to group similar colors
                    const roundedR = Math.round(r / 10) * 10;
                    const roundedG = Math.round(g / 10) * 10;
                    const roundedB = Math.round(b / 10) * 10;

                    const colorKey = `${roundedR},${roundedG},${roundedB}`;
                    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
                }

                // Sort by frequency and get top colors
                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, colorCount)
                    .map(([color]) => {
                        const [r, g, b] = color.split(",").map(Number);
                        return rgbToHex(r, g, b);
                    });

                // Map to nearest base colors and remove duplicates (returning names)
                const baseColorsNames = sortedColors.map(getNearestBaseColorName);
                const uniqueBaseColors = Array.from(new Set(baseColorsNames));

                resolve(uniqueBaseColors);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
    });
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b]
        .map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        })
        .join("");
}

export const BASE_COLORS = [
    { name: "red", hex: "#FF0000" },
    { name: "orange", hex: "#FFA500" },
    { name: "yellow", hex: "#FFFF00" },
    { name: "green", hex: "#008000" },
    { name: "blue", hex: "#0000FF" },
    { name: "purple", hex: "#800080" },
    { name: "pink", hex: "#FFC0CB" },
    { name: "brown", hex: "#A52A2A" },
    { name: "black", hex: "#000000" },
    { name: "white", hex: "#FFFFFF" },
    { name: "gray", hex: "#808080" },
    { name: "teal", hex: "#008080" },
    { name: "navy", hex: "#000080" }
];

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function colorDistance(rgb1: { r: number, g: number, b: number }, rgb2: { r: number, g: number, b: number }) {
    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
}

export function getNearestBaseColorName(hex: string): string {
    const rgb = hexToRgb(hex);
    let minDistance = Infinity;
    let closestName = BASE_COLORS[0].name;

    for (const baseColor of BASE_COLORS) {
        const baseRgb = hexToRgb(baseColor.hex);
        const distance = colorDistance(rgb, baseRgb);
        if (distance < minDistance) {
            minDistance = distance;
            closestName = baseColor.name;
        }
    }

    return closestName;
}
