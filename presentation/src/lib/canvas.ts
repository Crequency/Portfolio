import type { SlideDefinition } from './slideRegistry';

export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540; // 16:9

// Tight tile layout: each slide is immediately adjacent with a small gutter
const GAP = 20;
export const SPACING_X = SLIDE_WIDTH + GAP;   // 980 — tile width + gutter
export const SPACING_Y = SLIDE_HEIGHT + GAP;  // 560 — tile height + gutter

export const ZOOM_OUT_SCALE = 0.2;

export interface CanvasPosition {
  centerX: number;
  centerY: number;
}

export function getSlideCenter(slide: SlideDefinition): CanvasPosition {
  return {
    centerX: slide.col * SPACING_X,
    centerY: slide.row * SPACING_Y,
  };
}

export interface CanvasBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  width: number;
  height: number;
}

export function getCanvasBounds(slides: SlideDefinition[]): CanvasBounds {
  if (slides.length === 0) {
    return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0, width: 0, height: 0 };
  }

  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const slide of slides) {
    if (slide.row < minRow) minRow = slide.row;
    if (slide.row > maxRow) maxRow = slide.row;
    if (slide.col < minCol) minCol = slide.col;
    if (slide.col > maxCol) maxCol = slide.col;
  }

  // Add 2 slides of padding on each side
  const width = (maxCol - minCol + 2) * SPACING_X;
  const height = (maxRow - minRow + 2) * SPACING_Y;

  return { minRow, maxRow, minCol, maxCol, width, height };
}

export function computeOffsets(
  viewportWidth: number,
  viewportHeight: number,
  slideCenter: CanvasPosition,
  zoom: number
): { x: number; y: number } {
  const viewportCenterX = viewportWidth / 2;
  const viewportCenterY = viewportHeight / 2;

  return {
    x: viewportCenterX - slideCenter.centerX * zoom,
    y: viewportCenterY - slideCenter.centerY * zoom,
  };
}
