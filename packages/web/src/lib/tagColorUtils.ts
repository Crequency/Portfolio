/**
 * Compute background and text colors from a single hex color.
 * Produces distinct, readable tag chips that adapt to light/dark themes.
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Given a hex color, returns { bg, text } for a tag chip.
 * - Background: saturated, theme-appropriate transparency
 * - Text: darker version for contrast
 */
export function computeTagColors(hex?: string): { bg: string; text: string } {
  if (!hex) return { bg: '#e5e7eb', text: '#374151' };

  const rgb = hexToRgb(hex);
  if (!rgb) return { bg: '#e5e7eb', text: '#374151' };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const dark = isDarkMode();

  // Keep the hue and most saturation, adjust lightness for theme
  if (dark) {
    // Dark mode: darker bg, lighter text
    const bgRgb = hslToRgb(hsl.h, Math.max(hsl.s, 55), 22);
    const textRgb = hslToRgb(hsl.h, Math.min(hsl.s + 10, 90), 80);
    return {
      bg: rgbToHex(Math.round(bgRgb.r * 0.35 + rgb.r * 0.65), Math.round(bgRgb.g * 0.35 + rgb.g * 0.65), Math.round(bgRgb.b * 0.35 + rgb.b * 0.65)), // 35% computed + 65% original → saturated dark bg
      text: rgbToHex(textRgb.r, textRgb.g, textRgb.b),
    };
  } else {
    // Light mode: pastel bg (but more saturated than before), darker text
    const bgRgb = hslToRgb(hsl.h, Math.min(hsl.s, 50), 90);
    const textRgb = hslToRgb(hsl.h, Math.max(hsl.s, 50), 30);
    return {
      bg: rgbToHex(Math.round(bgRgb.r * 0.3 + rgb.r * 0.7), Math.round(bgRgb.g * 0.3 + rgb.g * 0.7), Math.round(bgRgb.b * 0.3 + rgb.b * 0.7)), // 30% pastel + 70% original → soft but distinct
      text: rgbToHex(textRgb.r, textRgb.g, textRgb.b),
    };
  }
}

/** Pre-defined palette for quick tag color selection */
export const TAG_PALETTE = [
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  '#0891b2', '#2563eb', '#7c3aed', '#c026d3',
  '#db2777', '#4b5563',
];
