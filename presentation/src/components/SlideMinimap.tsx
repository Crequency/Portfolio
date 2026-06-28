import { useMemo, useCallback } from 'react';
import { getSlides, getChildren } from '@/lib/slideTree';

interface SlideMinimapProps {
  currentSlideId: string;
  onNavigate: (slideId: string) => void;
  isTransitioning: boolean;
}

// Minimap layout — 16:9 tiles packed tightly with small gutter
const CELL_W = 48;
const CELL_H = 27;
const MGAP = 3;
const STEP_X = CELL_W + MGAP;
const STEP_Y = CELL_H + MGAP;
const PADDING = 12;

export function SlideMinimap({ currentSlideId, onNavigate, isTransitioning }: SlideMinimapProps) {
  const slides = getSlides();

  // Compute grid bounds once
  const { minCol, maxCol, minRow, maxRow, nCols, nRows, svgW, svgH } = useMemo(() => {
    let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
    for (const s of slides) {
      if (s.col < minC) minC = s.col;
      if (s.col > maxC) maxC = s.col;
      if (s.row < minR) minR = s.row;
      if (s.row > maxR) maxR = s.row;
    }
    const nc = maxC - minC + 1;
    const nr = maxR - minR + 1;
    return {
      minCol: minC, maxCol: maxC, minRow: minR, maxRow: maxR,
      nCols: nc, nRows: nr,
      svgW: nc * STEP_X - MGAP + PADDING * 2,
      svgH: nr * STEP_Y - MGAP + PADDING * 2,
    };
  }, [slides]);

  // Build the cell grid
  const cells = useMemo(() => {
    const result: Array<{ x: number; y: number; filled: boolean }> = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const col = minCol + c;
        const row = minRow + r;
        result.push({
          x: PADDING + c * STEP_X,
          y: PADDING + r * STEP_Y,
          filled: slides.some((s) => s.col === col && s.row === row),
        });
      }
    }
    return result;
  }, [slides, minCol, minRow, nCols, nRows]);

  // Build edge list
  const edges = useMemo(() => {
    const result: Array<{ parentCol: number; parentRow: number; childCol: number; childRow: number; key: string }> = [];
    for (const slide of slides) {
      const children = getChildren(slide);
      for (const child of children) {
        result.push({
          parentCol: slide.col, parentRow: slide.row,
          childCol: child.col, childRow: child.row,
          key: `edge-${slide.id}-${child.id}`,
        });
      }
    }
    return result;
  }, [slides]);

  // Map grid position → minimap pixel center
  const toPixel = useCallback(
    (col: number, row: number) => ({
      x: PADDING + (col - minCol) * STEP_X + CELL_W / 2,
      y: PADDING + (row - minRow) * STEP_Y + CELL_H / 2,
    }),
    [minCol, minRow]
  );

  const handleClick = useCallback(
    (slideId: string) => {
      if (!isTransitioning) onNavigate(slideId);
    },
    [isTransitioning, onNavigate]
  );

  const activeSlide = slides.find((s) => s.id === currentSlideId);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Graph paper cells */}
      {cells.map((cell, i) => (
        <rect
          key={`cell-${i}`}
          x={cell.x} y={cell.y}
          width={CELL_W} height={CELL_H} rx={2}
          fill={cell.filled ? 'hsl(var(--card))' : 'hsl(var(--muted) / 0.3)'}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={cell.filled ? 1 : 0.4}
        />
      ))}

      {/* Tree connection lines */}
      {edges.map((edge) => {
        const pp = toPixel(edge.parentCol, edge.parentRow);
        const cp = toPixel(edge.childCol, edge.childRow);
        const midY = (pp.y + cp.y) / 2;
        const d = `M${pp.x},${pp.y + CELL_H / 2} L${pp.x},${midY} L${cp.x},${midY} L${cp.x},${cp.y - CELL_H / 2}`;
        return (
          <path
            key={edge.key}
            d={d}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            opacity={0.4}
          />
        );
      })}

      {/* Slide nodes */}
      {slides.map((slide, idx) => {
        const pos = toPixel(slide.col, slide.row);
        const isActive = slide.id === currentSlideId;
        const left = pos.x - CELL_W / 2;
        const top = pos.y - CELL_H / 2;
        return (
          <g
            key={slide.id}
            onClick={() => handleClick(slide.id)}
            className="cursor-pointer"
          >
            {/* Slide tile */}
            <rect
              x={left + 1}
              y={top + 1}
              width={CELL_W - 2} height={CELL_H - 2}
              rx={2}
              fill={isActive ? 'url(#minimap-active-grad)' : 'hsl(var(--card))'}
              stroke={isActive ? '#7C3AED' : 'hsl(var(--border))'}
              strokeWidth={isActive ? 1.5 : 0.6}
            />
            {/* Sequence number badge — top-left corner */}
            <rect
              x={left + 1.5}
              y={top + 1.5}
              width={10} height={7}
              rx={1.5}
              fill={isActive ? 'rgba(255,255,255,0.25)' : 'hsl(var(--muted))'}
            />
            <text
              x={left + 6.5}
              y={top + 5.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={5}
              fill={isActive ? 'white' : 'hsl(var(--muted-foreground))'}
              fontWeight={700}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {idx + 1}
            </text>
            {/* Title text */}
            <text
              x={pos.x} y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={6.5}
              fill={isActive ? 'white' : 'hsl(var(--muted-foreground))'}
              fontWeight={isActive ? 600 : 400}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {slide.title.length > 5 ? slide.title.slice(0, 5) + '…' : slide.title}
            </text>
          </g>
        );
      })}

      {/* Active slide glow ring */}
      {activeSlide && (() => {
        const pos = toPixel(activeSlide.col, activeSlide.row);
        return (
          <rect
            x={pos.x - CELL_W / 2} y={pos.y - CELL_H / 2}
            width={CELL_W} height={CELL_H} rx={3}
            fill="none"
            stroke="#7C3AED"
            strokeWidth={2}
            style={{ animation: 'minimap-pulse 2s ease-in-out infinite' }}
          />
        );
      })()}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="minimap-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
