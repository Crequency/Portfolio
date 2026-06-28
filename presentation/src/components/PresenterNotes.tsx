import { useRef } from 'react';
import { FileText, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, ArrowDownToLine, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { SlideDefinition } from '@/lib/slideRegistry';
import { getSlides, getSlidePath } from '@/lib/slideTree';
import { SlideMinimap } from './SlideMinimap';
import { FloatingPanel } from './FloatingPanel';

interface PresenterNotesProps {
  title: string;
  notes: string;
  currentSlide: SlideDefinition | null;
  canGoUp: boolean;
  canGoDown: boolean;
  canGoLeft: boolean;
  canGoRight: boolean;
  isTransitioning: boolean;
  onNavigate: (slideId: string) => void;
  manualZoom: number;
  onZoomChange: (zoom: number) => void;
}

export function PresenterNotes({
  title,
  notes,
  currentSlide,
  canGoUp,
  canGoDown,
  canGoLeft,
  canGoRight,
  isTransitioning,
  onNavigate,
  manualZoom,
  onZoomChange,
}: PresenterNotesProps) {
  const allSlides = getSlides();
  const idx = currentSlide ? allSlides.findIndex((s) => s.id === currentSlide.id) : -1;
  const path = currentSlide ? getSlidePath(currentSlide) : [];
  const notesContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={notesContainerRef} className="w-full flex-1 min-h-0 border-t bg-background/50 backdrop-blur-sm flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-2 border-b text-sm text-muted-foreground shrink-0">
        <FileText className="h-4 w-4" />
        <span>演讲者备注</span>
        <span className="text-muted-foreground/50">—</span>
        <span className="font-medium text-foreground truncate">{title}</span>
      </div>

      {/* Notes content (full width now, minimap is floating) */}
      <div className="notes-area flex-1 px-6 py-4 overflow-y-auto min-h-0">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {notes}
        </p>
      </div>

      {/* Floating minimap — draggable + resizable */}
      <FloatingPanel
        title="导航地图"
        initialX={16}
        initialY={16}
        initialW={195}
        initialH={180}
        minW={140}
        minH={100}
        containerRef={notesContainerRef}
      >
        <SlideMinimap
          currentSlideId={currentSlide?.id ?? ''}
          onNavigate={onNavigate}
          isTransitioning={isTransitioning}
        />
      </FloatingPanel>

      {/* Footer: zoom slider + nav controls + progress */}
      <div className="flex items-center justify-between px-6 py-2 border-t shrink-0 text-xs text-muted-foreground">
        {/* Zoom slider */}
        <div className="flex items-center gap-2">
          <ZoomOut className="h-3.5 w-3.5" />
          <input
            type="range"
            min="0.05"
            max="2.0"
            step="0.05"
            value={manualZoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-24 h-1 accent-[#7C3AED] cursor-pointer"
          />
          <ZoomIn className="h-3.5 w-3.5" />
          <span className="font-mono tabular-nums w-9 text-center">
            {Math.round(manualZoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(1.0)}
            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="重置缩放"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation hints */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60">操控：</span>
          <kbd className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono ${canGoUp ? 'bg-card' : 'bg-card/30 opacity-40'}`}>
            <ArrowUp className="h-3 w-3" />
          </kbd>
          <kbd className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono ${canGoDown ? 'bg-card' : 'bg-card/30 opacity-40'}`}>
            <ArrowDown className="h-3 w-3" />
          </kbd>
          <kbd className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono ${canGoLeft ? 'bg-card' : 'bg-card/30 opacity-40'}`}>
            <ArrowLeft className="h-3 w-3" />
          </kbd>
          <kbd className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono ${canGoRight ? 'bg-card' : 'bg-card/30 opacity-40'}`}>
            <ArrowRight className="h-3 w-3" />
          </kbd>
          <span className="text-muted-foreground/40 mx-1">|</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-card text-xs font-mono">
            <Home className="h-3 w-3" />
          </kbd>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-card text-xs font-mono">
            <ArrowDownToLine className="h-3 w-3" />
          </kbd>
          <span className="text-muted-foreground/40 mx-1">|</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-card text-xs font-mono">
            Esc
          </kbd>
        </div>

        {/* Progress: slide number + breadcrumb */}
        {currentSlide && (
          <div className="flex items-center gap-3">
            <span className="font-mono tabular-nums">
              {idx + 1} / {allSlides.length}
            </span>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1">
              {path.map((slide, i) => (
                <span key={slide.id} className="flex items-center gap-1">
                  <span className={i === path.length - 1 ? 'text-foreground font-medium' : ''}>
                    {slide.title.length > 12 ? slide.title.slice(0, 12) + '…' : slide.title}
                  </span>
                  {i < path.length - 1 && (
                    <span className="text-muted-foreground/40">›</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
