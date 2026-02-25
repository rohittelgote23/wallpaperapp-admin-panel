/**
 * Extracts a color palette from an image URL using Canvas API
 * Returns an array of nearest base color names
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
                if (!ctx) return reject("Canvas not supported");

                // Better resizing: preserve color accuracy
                const maxSize = 250;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

                const colorMap = new Map<string, number>();

                // Highly accurate sampling (every 16th pixel)
                for (let i = 0; i < data.length; i += 16 * 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 150) continue; // ignore transparent pixels

                    // Smooth grouping (better than rounding by 10)
                    const rr = Math.round(r / 5) * 5;
                    const gg = Math.round(g / 5) * 5;
                    const bb = Math.round(b / 5) * 5;

                    const key = `${rr},${gg},${bb}`;
                    colorMap.set(key, (colorMap.get(key) || 0) + 1);
                }

                // Pick top dominant colors
                const dominantHexColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, colorCount)
                    .map(([rgb]) => {
                        const [r, g, b] = rgb.split(",").map(Number);
                        return rgbToHex(r, g, b);
                    });

                // Convert hex → base color names
                const baseColorNames = dominantHexColors.map(getNearestBaseColorName);

                resolve([...new Set(baseColorNames)]);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
    });
}

/* ------------------------------
    Color Conversion Utilities
--------------------------------*/

function rgbToHex(r: number, g: number, b: number): string {
    return (
        "#" +
        [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
    );
}

function hexToRgb(hex: string) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

/* ------------------------------
       Base Color Definitions
--------------------------------*/

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
    { name: "navy", hex: "#000080" },
    { name: "sand", hex: "#C2B280" },
    { name: "light blue", hex: "#ADD8E6" },
    { name: "cyan", hex: "#00FFFF" },
    { name: "magenta", hex: "#FF00FF" },
    { name: "maroon", hex: "#800000" },
    { name: "olive", hex: "#808000" },
    { name: "peach", hex: "#FFE5B4" }
];

/* ------------------------------
    Redmean Color Distance
--------------------------------*/

function colorDistance(
    rgb1: { r: number; g: number; b: number },
    rgb2: { r: number; g: number; b: number }
) {
    const rMean = (rgb1.r + rgb2.r) / 2;
    const dR = rgb1.r - rgb2.r;
    const dG = rgb1.g - rgb2.g;
    const dB = rgb1.b - rgb2.b;

    return Math.sqrt(
        (2 + rMean / 256) * dR * dR +
        4 * dG * dG +
        (2 + (255 - rMean) / 256) * dB * dB
    );
}

/* ------------------------------
    Matching HEX → Base Color Name
--------------------------------*/

export function getNearestBaseColorName(hex: string): string {
    const rgb = hexToRgb(hex);

    let minDist = Infinity;
    let bestMatch = BASE_COLORS[0].name;

    for (const base of BASE_COLORS) {
        const dist = colorDistance(rgb, hexToRgb(base.hex));
        if (dist < minDist) {
            minDist = dist;
            bestMatch = base.name;
        }
    }

    return bestMatch;
}