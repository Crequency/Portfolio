import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { GripHorizontal, Maximize2 } from 'lucide-react';

interface FloatingPanelProps {
  title: string;
  initialX?: number;
  initialY?: number;
  initialW?: number;
  initialH?: number;
  minW?: number;
  minH?: number;
  children: ReactNode;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function FloatingPanel({
  title,
  initialX = 16,
  initialY = 16,
  initialW = 200,
  initialH = 160,
  minW = 120,
  minH = 80,
  children,
  containerRef,
}: FloatingPanelProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialW, h: initialH });

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- Drag ---
  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    },
    [pos]
  );

  // --- Resize ---
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h };
    },
    [size]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Drag
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const container = containerRef.current;
        const panel = panelRef.current;
        let nx = dragRef.current.origX + dx;
        let ny = dragRef.current.origY + dy;
        if (container && panel) {
          const cr = container.getBoundingClientRect();
          const pr = panel.getBoundingClientRect();
          nx = Math.max(0, Math.min(nx, cr.width - pr.width));
          ny = Math.max(0, Math.min(ny, cr.height - pr.height));
        }
        setPos({ x: nx, y: ny });
      }
      // Resize
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const nw = Math.max(minW, resizeRef.current.origW + dx);
        const nh = Math.max(minH, resizeRef.current.origH + dy);
        setSize({ w: nw, h: nh });
      }
    };

    const onMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerRef, minW, minH]);

  return (
    <div
      ref={panelRef}
      className="absolute z-20 rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
      }}
    >
      {/* Drag handle bar */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b bg-muted/30 cursor-move select-none shrink-0"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GripHorizontal className="h-3 w-3" />
          <span className="font-medium">{title}</span>
        </div>
      </div>

      {/* Content — fills remaining space */}
      <div className="flex-1 min-h-0">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
        onMouseDown={onResizeStart}
      >
        <Maximize2 className="h-3 w-3 text-muted-foreground/50 rotate-90" />
      </div>
    </div>
  );
}
