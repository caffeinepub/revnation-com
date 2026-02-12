// Deterministic color detection and palette generation utilities

// Common color name to hex mapping
const COLOR_NAMES: Record<string, string> = {
  // Basic colors
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  brown: '#A52A2A',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  grey: '#808080',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  lime: '#00FF00',
  maroon: '#800000',
  navy: '#000080',
  olive: '#808000',
  teal: '#008080',
  aqua: '#00FFFF',
  silver: '#C0C0C0',
  gold: '#FFD700',
  indigo: '#4B0082',
  violet: '#EE82EE',
  turquoise: '#40E0D0',
  coral: '#FF7F50',
  salmon: '#FA8072',
  khaki: '#F0E68C',
  crimson: '#DC143C',
  lavender: '#E6E6FA',
  beige: '#F5F5DC',
  ivory: '#FFFFF0',
  tan: '#D2B48C',
  peach: '#FFDAB9',
  mint: '#98FF98',
  sky: '#87CEEB',
  rose: '#FF007F',
  plum: '#DDA0DD',
};

/**
 * Extract hex color codes from text (supports #RGB and #RRGGBB, case-insensitive)
 */
export function extractHexColors(text: string): string[] {
  const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  const matches = text.match(hexPattern) || [];
  
  // Normalize 3-digit hex to 6-digit and deduplicate
  const normalized = matches.map(hex => {
    const cleaned = hex.toUpperCase();
    if (cleaned.length === 4) {
      // #RGB -> #RRGGBB
      const r = cleaned[1];
      const g = cleaned[2];
      const b = cleaned[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return cleaned;
  });
  
  return Array.from(new Set(normalized));
}

/**
 * Extract color names from text and map them to hex codes
 */
export function extractColorNames(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundColors: string[] = [];
  
  // Sort by length (longest first) to match "dark blue" before "blue"
  const colorNames = Object.keys(COLOR_NAMES).sort((a, b) => b.length - a.length);
  
  for (const colorName of colorNames) {
    // Use word boundaries to avoid partial matches
    const pattern = new RegExp(`\\b${colorName}\\b`, 'gi');
    if (pattern.test(lowerText)) {
      foundColors.push(COLOR_NAMES[colorName]);
    }
  }
  
  // Deduplicate
  return Array.from(new Set(foundColors));
}

/**
 * Generate light and dark variants of a color
 */
function generateVariants(hex: string): string[] {
  const variants: string[] = [hex];
  
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Generate lighter variant (add 40 to each channel, cap at 255)
  const lightR = Math.min(255, r + 40);
  const lightG = Math.min(255, g + 40);
  const lightB = Math.min(255, b + 40);
  const lighter = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`.toUpperCase();
  
  // Generate darker variant (subtract 40 from each channel, floor at 0)
  const darkR = Math.max(0, r - 40);
  const darkG = Math.max(0, g - 40);
  const darkB = Math.max(0, b - 40);
  const darker = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`.toUpperCase();
  
  // Only add variants if they're different from the base
  if (lighter !== hex) variants.push(lighter);
  if (darker !== hex) variants.push(darker);
  
  return variants;
}

/**
 * Generate a palette from detected colors in text
 * Returns unique colors with optional variants
 */
export function generatePaletteFromText(text: string): string[] {
  const hexColors = extractHexColors(text);
  const namedColors = extractColorNames(text);
  
  // Combine and deduplicate
  const allColors = [...hexColors, ...namedColors];
  const uniqueColors = Array.from(new Set(allColors));
  
  // If no colors detected, return empty array
  if (uniqueColors.length === 0) {
    return [];
  }
  
  // Generate variants for each unique color
  const paletteWithVariants: string[] = [];
  for (const color of uniqueColors) {
    const variants = generateVariants(color);
    paletteWithVariants.push(...variants);
  }
  
  // Deduplicate again after variants
  return Array.from(new Set(paletteWithVariants));
}

/**
 * Validate and normalize a hex color code
 */
export function validateHexColor(hex: string): string | null {
  const cleaned = hex.trim().toUpperCase();
  
  // Add # if missing
  const withHash = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
  
  // Validate format
  const hexPattern = /^#([0-9A-F]{3}|[0-9A-F]{6})$/;
  if (!hexPattern.test(withHash)) {
    return null;
  }
  
  // Normalize 3-digit to 6-digit
  if (withHash.length === 4) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  
  return withHash;
}

/**
 * Get color name from hex code (reverse lookup)
 */
export function getColorNameFromHex(hex: string): string | null {
  const normalized = hex.toUpperCase();
  for (const [name, hexValue] of Object.entries(COLOR_NAMES)) {
    if (hexValue === normalized) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return null;
}
