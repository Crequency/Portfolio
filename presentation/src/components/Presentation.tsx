import { useRef, useCallback, useState, useEffect } from 'react';
import { useCanvasSize } from '@/hooks/useCanvasSize';
import { useNavigation } from '@/hooks/useNavigation';
import { useSlideTransition } from '@/hooks/useSlideTransition';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { getSlideById } from '@/lib/slideTree';
import { SlideCanvas } from './SlideCanvas';
import { PresenterNotes } from './PresenterNotes';

export function Presentation() {
  const canvasSize = useCanvasSize();

  const canvasSurfaceRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  // Manual zoom via slider
  const [manualZoom, setManualZoom] = useState(1.0);
  const manualZoomRef = useRef(1.0);

  // Shift+drag panning state
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const isDraggingRef = useRef(false);
  const hasPannedRef = useRef(false);
  const panStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const [_phase, setPhase] = useState<'idle' | 'zoomed-out' | 'zooming-in'>('idle');

  const {
    currentSlide,
    isTransitioning,
    canGoDown,
    canGoUp,
    canGoLeft,
    canGoRight,
    goDown,
    goUp,
    goLeft,
    goRight,
    goHome,
    goEnd,
    goToSlide,
    handleTransitionComplete,
  } = useNavigation();

  const handlePhaseChange = useCallback(
    (newPhase: 'idle' | 'zoomed-out' | 'zooming-in') => {
      setPhase(newPhase);
    },
    []
  );

  const { transitionTo, jumpTo, animateZoom, panStart, panBy, panEnd } = useSlideTransition({
    viewportWidth: canvasSize.width,
    viewportHeight: canvasSize.height,
    canvasSurfaceRef,
    backgroundRef,
    manualZoomRef,
    onPhaseChange: handlePhaseChange,
  });

  // Initial jump to the first slide once the canvas surface is ready
  useEffect(() => {
    if (canvasSurfaceRef.current && currentSlide) {
      jumpTo(currentSlide);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Shift key tracking ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
        e.preventDefault();
        setIsShiftHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        setIsShiftHeld(false);
        // Return to current slide if any panning occurred
        if (hasPannedRef.current && currentSlide) {
          hasPannedRef.current = false;
          isDraggingRef.current = false;
          panStartPosRef.current = null;
          panEnd(currentSlide);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [currentSlide, panEnd]);

  // --- Slide area mouse handlers for shift+drag panning ---
  const handleSlideMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isShiftHeld || isTransitioning) return;
      e.preventDefault();
      isDraggingRef.current = true;
      panStartPosRef.current = { x: e.clientX, y: e.clientY };
      panStart();
    },
    [isShiftHeld, isTransitioning, panStart]
  );

  const handleSlideMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current || !panStartPosRef.current) return;
      const dx = e.clientX - panStartPosRef.current.x;
      const dy = e.clientY - panStartPosRef.current.y;
      panBy(dx, dy);
      hasPannedRef.current = true;
    },
    [panBy]
  );

  const handleSlideMouseUp = useCallback(
    (_e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      panStartPosRef.current = null;
    },
    []
  );

  // Minimap click handler — sync nav state then animate
  const handleMinimapNavigate = useCallback(
    (slideId: string) => {
      if (isTransitioning) return;
      const target = getSlideById(slideId);
      if (target) {
        goToSlide(target.id); // update currentSlideId immediately
        transitionTo(target, handleTransitionComplete);
      }
    },
    [isTransitioning, transitionTo, goToSlide, handleTransitionComplete]
  );

  // Zoom slider handler — anchored at current slide center
  const handleZoomChange = useCallback(
    (newZoom: number) => {
      manualZoomRef.current = newZoom;
      setManualZoom(newZoom);
      if (!isTransitioning && currentSlide) {
        animateZoom(currentSlide, newZoom);
      }
    },
    [isTransitioning, currentSlide, animateZoom]
  );

  // Keyboard nav — only active when space is NOT held
  useKeyboardNav(
    {
      goDown,
      goUp,
      goLeft,
      goRight,
      goHome,
      goEnd,
      isTransitioning: isTransitioning || isShiftHeld,
    },
    { transitionTo, jumpTo },
    handleTransitionComplete
  );

  return (
    <div className="h-screen flex flex-col items-center overflow-hidden bg-background">
      {/* Slide area — supports shift+drag panning */}
      <div
        className="relative flex-shrink-0 select-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          cursor: isShiftHeld ? 'grab' : 'default',
        }}
        onMouseDown={handleSlideMouseDown}
        onMouseMove={handleSlideMouseMove}
        onMouseUp={handleSlideMouseUp}
        onMouseLeave={handleSlideMouseUp}
      >
        <SlideCanvas
          surfaceRef={(el) => {
            canvasSurfaceRef.current = el;
          }}
          viewportWidth={canvasSize.width}
          viewportHeight={canvasSize.height}
          currentSlideId={currentSlide?.id ?? ''}
          setBackgroundRef={(el) => { backgroundRef.current = el; }}
        />

        {/* Shift-held hint */}
        {isShiftHeld && !isDraggingRef.current && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-lg bg-card/80 backdrop-blur-sm border px-4 py-2 text-sm text-muted-foreground shadow-md">
              Shift + 拖拽以浏览大画布 · 松开 Shift 返回
            </div>
          </div>
        )}
      </div>

      {/* Presenter notes — includes floating minimap, zoom slider, nav controls */}
      <PresenterNotes
        title={currentSlide?.title ?? ''}
        notes={currentSlide?.notes ?? ''}
        currentSlide={currentSlide}
        canGoUp={canGoUp}
        canGoDown={canGoDown}
        canGoLeft={canGoLeft}
        canGoRight={canGoRight}
        isTransitioning={isTransitioning}
        onNavigate={handleMinimapNavigate}
        manualZoom={manualZoom}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
}
