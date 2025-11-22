/**
 * Dynamic color system for generating unlimited distinct colors for prompt features
 * Uses HSL with golden ratio spacing for maximum visual distinction
 */

export interface ColorConfig {
  background: string;
  border: string;
  text: string;
  hover: string;
  shadow: string;
}

export interface FeatureColor extends ColorConfig {
  id: string;
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
}

/**
 * Golden ratio conjugate for optimal color distribution
 */
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * Generate a unique color for a feature using golden ratio spacing
 * @param featureId Unique identifier for the feature
 * @param featureName Display name for color fallback
 * @returns Color configuration object
 */
export const generateFeatureColor = (featureId: string, featureName: string): FeatureColor => {
  // Create a hash from the feature ID for consistent color generation
  let hash = 0;
  for (let i = 0; i < featureId.length; i++) {
    const char = featureId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use golden ratio conjugate for well-distributed hues
  const hue = (hash * GOLDEN_RATIO_CONJUGATE * 360) % 360;
  
  // Varied saturation and lightness for visual distinction
  const saturation = 70 + ((hash * 13) % 25); // 70-95%
  const lightness = 65 + ((hash * 17) % 20);  // 65-85%

  // Convert HSL to RGB and then to hex for Tailwind compatibility
  const rgb = hslToRgb(hue, saturation, lightness);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // Calculate text color (black or white) based on background brightness
  const textColor = getContrastColor(rgb);

  // Generate hover and shadow variants
  const hoverRgb = adjustBrightness(rgb, 1.1);
  const hoverHex = rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b);
  
  const borderHex = rgbToHex(
    Math.max(0, rgb.r - 40),
    Math.max(0, rgb.g - 40),
    Math.max(0, rgb.b - 40)
  );

  return {
    id: featureId,
    name: featureName,
    hue,
    saturation,
    lightness,
    background: `bg-[${hex}]`,
    border: `border-[${borderHex}]`,
    text: textColor === 'dark' ? 'text-gray-900' : 'text-white',
    hover: `hover:bg-[${hoverHex}]`,
    shadow: `shadow-[${hex}]30`
  };
};

/**
 * Convert HSL to RGB
 */
const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Convert RGB to hex
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Adjust brightness of RGB color
 */
const adjustBrightness = (rgb: { r: number; g: number; b: number }, factor: number): { r: number; g: number; b: number } => {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r * factor))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g * factor))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b * factor)))
  };
};

/**
 * Get optimal text color (dark or light) for contrast
 */
const getContrastColor = (rgb: { r: number; g: number; b: number }): 'dark' | 'light' => {
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
};

/**
 * Get display mode based on number of features
 */
export const getDisplayMode = (featureCount: number): 'compact' | 'grid' | 'virtualized' => {
  if (featureCount <= 10) return 'compact';
  if (featureCount <= 50) return 'grid';
  return 'virtualized';
};

/**
 * Get layout configuration based on display mode
 */
export const getLayoutConfig = (mode: 'compact' | 'grid' | 'virtualized') => {
  switch (mode) {
    case 'compact':
      return {
        maxHeight: 'max-h-none',
        overflow: 'overflow-visible',
        spacing: 'space-y-3',
        textSize: 'text-sm',
        padding: 'p-4'
      };
    case 'grid':
      return {
        maxHeight: 'max-h-96',
        overflow: 'overflow-y-auto',
        spacing: 'space-y-2',
        textSize: 'text-xs',
        padding: 'p-3'
      };
    case 'virtualized':
      return {
        maxHeight: 'max-h-80',
        overflow: 'overflow-y-auto',
        spacing: 'space-y-1',
        textSize: 'text-xs',
        padding: 'p-2'
      };
    default:
      return {
        maxHeight: 'max-h-none',
        overflow: 'overflow-visible',
        spacing: 'space-y-3',
        textSize: 'text-sm',
        padding: 'p-4'
      };
  }
};

/**
 * Predefined color palette for built-in features (for backward compatibility)
 */
export const BUILTIN_FEATURE_COLORS: Record<string, ColorConfig> = {
  empathyFriendlyTone: {
    background: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    hover: 'hover:bg-blue-200',
    shadow: 'shadow-blue-100'
  },
  cleverJokes: {
    background: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    hover: 'hover:bg-yellow-200',
    shadow: 'shadow-yellow-100'
  },
  holisticView: {
    background: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-900',
    hover: 'hover:bg-green-200',
    shadow: 'shadow-green-100'
  },
  numberedSteps: {
    background: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-900',
    hover: 'hover:bg-purple-200',
    shadow: 'shadow-purple-100'
  },
  subtaskDelegation: {
    background: 'bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-900',
    hover: 'hover:bg-indigo-200',
    shadow: 'shadow-indigo-100'
  },
  bestPractices: {
    background: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-900',
    hover: 'hover:bg-red-200',
    shadow: 'shadow-red-100'
  },
  devWorkflows: {
    background: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900',
    hover: 'hover:bg-orange-200',
    shadow: 'shadow-orange-100'
  },
  userEducation: {
    background: 'bg-pink-100',
    border: 'border-pink-300',
    text: 'text-pink-900',
    hover: 'hover:bg-pink-200',
    shadow: 'shadow-pink-100'
  },
  perplexityMcp: {
    background: 'bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-900',
    hover: 'hover:bg-teal-200',
    shadow: 'shadow-teal-100'
  },
  mermaidDiagrams: {
    background: 'bg-cyan-100',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    hover: 'hover:bg-cyan-200',
    shadow: 'shadow-cyan-100'
  }
};

/**
 * Category base hues for consistent color families
 */
const CATEGORY_BASE_HUES: Record<string, number> = {
  'communication-style': 240,    // Blue family
  'process-planning': 120,       // Green family
  'technical-expertise': 280,    // Purple family
  'tool-integration': 30,        // Orange family
};

/**
 * Generate category-based color variations
 */
const generateCategoryColor = (featureId: string, featureName: string, categoryId: string): FeatureColor => {
  // Use hash from feature ID to ensure consistency
  let hash = 0;
  for (let i = 0; i < featureId.length; i++) {
    const char = featureId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get base hue for the category
  const baseHue = CATEGORY_BASE_HUES[categoryId] || 200; // Default blue-ish
  const hueVariation = ((hash * 13) % 40) - 20; // ±20° variation
  const hue = (baseHue + hueVariation + 360) % 360;
  
  // Varied saturation and lightness for visual distinction within category
  const saturation = 65 + ((hash * 17) % 25); // 65-90%
  const lightness = 70 + ((hash * 19) % 20);  // 70-90%

  // Convert HSL to RGB and then to hex for Tailwind compatibility
  const rgb = hslToRgb(hue, saturation, lightness);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // Calculate text color (black or white) based on background brightness
  const textColor = getContrastColor(rgb);

  // Generate hover and shadow variants
  const hoverRgb = adjustBrightness(rgb, 1.1);
  const hoverHex = rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b);
  
  const borderHex = rgbToHex(
    Math.max(0, rgb.r - 35),
    Math.max(0, rgb.g - 35),
    Math.max(0, rgb.b - 35)
  );

  return {
    id: featureId,
    name: featureName,
    hue,
    saturation,
    lightness,
    background: `bg-[${hex}]`,
    border: `border-[${borderHex}]`,
    text: textColor === 'dark' ? 'text-gray-900' : 'text-white',
    hover: `hover:bg-[${hoverHex}]`,
    shadow: `shadow-[${hex}]30`
  };
};

/**
 * Get color for a feature (built-in or custom)
 */
export const getFeatureColor = (featureId: string, featureName: string, categoryId?: string): ColorConfig => {
  // Check if it's a built-in feature with predefined color (for backward compatibility)
  if (BUILTIN_FEATURE_COLORS[featureId] && !categoryId) {
    return BUILTIN_FEATURE_COLORS[featureId];
  }
  
  // Generate category-based color if category is provided
  if (categoryId) {
    const color = generateCategoryColor(featureId, featureName, categoryId);
    return {
      background: color.background,
      border: color.border,
      text: color.text,
      hover: color.hover,
      shadow: color.shadow
    };
  }
  
  // Fallback to dynamic color for custom features without category
  const color = generateFeatureColor(featureId, featureName);
  return {
    background: color.background,
    border: color.border,
    text: color.text,
    hover: color.hover,
    shadow: color.shadow
  };
};