import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ZOOM_OUT_SCALE, computeOffsets, getSlideCenter } from '@/lib/canvas';
import type { SlideDefinition } from '@/lib/slideRegistry';

interface UseSlideTransitionOptions {
  viewportWidth: number;
  viewportHeight: number;
  canvasSurfaceRef: React.RefObject<HTMLDivElement | null>;
  backgroundRef: React.RefObject<HTMLDivElement | null>;
  manualZoomRef: React.RefObject<number>;
  onPhaseChange?: (phase: 'idle' | 'zoomed-out' | 'zooming-in') => void;
}

const ZOOM_SPEED = 0.25;   // duration for zoom-out and zoom-in
const PAN_SPEED = 0.3;     // duration for pan between slides
const PAUSE = 0.4;         // pause at zoomed-out state

export function useSlideTransition(options: UseSlideTransitionOptions) {
  const {
    viewportWidth,
    viewportHeight,
    canvasSurfaceRef,
    backgroundRef,
    manualZoomRef,
    onPhaseChange,
  } = options;
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  const transitionTo = useCallback(
    (targetSlide: SlideDefinition, onComplete?: () => void) => {
      const el = canvasSurfaceRef.current;
      if (!el) return;

      if (isAnimatingRef.current) {
        tlRef.current?.kill();
      }

      const z = manualZoomRef.current;
      const targetCenter = getSlideCenter(targetSlide);

      // Read current camera state
      const curS = (gsap.getProperty(el, 'scale') as number) || z;
      const curX = (gsap.getProperty(el, 'x') as number) || 0;
      const curY = (gsap.getProperty(el, 'y') as number) || 0;

      // Canvas point currently at the viewport center
      const anchorCX = (viewportWidth / 2 - curX) / curS;
      const anchorCY = (viewportHeight / 2 - curY) / curS;

      const zOut = ZOOM_OUT_SCALE * z;

      // Phase A target: zoomed out, centered on current anchor
      const zOutCurX = viewportWidth / 2 - anchorCX * zOut;
      const zOutCurY = viewportHeight / 2 - anchorCY * zOut;

      // Phase C target: zoomed out, centered on target slide
      const zOutTargetX = viewportWidth / 2 - targetCenter.centerX * zOut;
      const zOutTargetY = viewportHeight / 2 - targetCenter.centerY * zOut;

      // Phase E target: zoomed in on target slide
      const zInTargetX = viewportWidth / 2 - targetCenter.centerX * z;
      const zInTargetY = viewportHeight / 2 - targetCenter.centerY * z;

      isAnimatingRef.current = true;
      onPhaseChange?.('zoomed-out');

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          onPhaseChange?.('idle');
          onComplete?.();
        },
      });

      tlRef.current = tl;

      // Phase A — Quick zoom out from current position (ease in-out)
      tl.to(el, {
        scale: zOut,
        x: zOutCurX,
        y: zOutCurY,
        duration: ZOOM_SPEED,
        ease: 'power2.inOut',
      });

      // Background fades in during zoom-out
      const bgEl = backgroundRef.current;
      if (bgEl) {
        tl.to(bgEl, { opacity: 0.6, duration: ZOOM_SPEED * 0.8, ease: 'power2.in' }, `<`);
      }

      // Phase B — Pause at zoomed-out state
      tl.to(el, { duration: PAUSE });

      // Phase C — Quick pan to target at zoomed-out level (ease in-out)
      tl.to(el, {
        x: zOutTargetX,
        y: zOutTargetY,
        duration: PAN_SPEED,
        ease: 'power2.inOut',
      });

      // Phase D — Pause over target
      tl.to(el, { duration: PAUSE });

      onPhaseChange?.('zooming-in');

      // Phase E — Quick zoom in to target (ease in-out)
      tl.to(el, {
        scale: z,
        x: zInTargetX,
        y: zInTargetY,
        duration: ZOOM_SPEED,
        ease: 'power2.inOut',
      });

      // Background fades out during zoom-in
      if (bgEl) {
        tl.to(bgEl, { opacity: 0, duration: ZOOM_SPEED * 0.8, ease: 'power2.out' }, `>-${ZOOM_SPEED * 0.2}`);
      }

      tl.play();
    },
    [viewportWidth, viewportHeight, canvasSurfaceRef, backgroundRef, manualZoomRef, onPhaseChange]
  );

  const jumpTo = useCallback(
    (targetSlide: SlideDefinition) => {
      const el = canvasSurfaceRef.current;
      if (!el) return;

      if (tlRef.current) {
        tlRef.current.kill();
        isAnimatingRef.current = false;
      }

      const z = manualZoomRef.current;
      const targetCenter = getSlideCenter(targetSlide);
      const offsets = computeOffsets(viewportWidth, viewportHeight, targetCenter, z);

      gsap.set(el, {
        scale: z,
        x: offsets.x,
        y: offsets.y,
      });

      const bgEl = backgroundRef.current;
      if (bgEl) {
        gsap.set(bgEl, { opacity: 0 });
      }

      onPhaseChange?.('idle');
    },
    [viewportWidth, viewportHeight, canvasSurfaceRef, backgroundRef, manualZoomRef, onPhaseChange]
  );

  // Smoothly animate to a new zoom level, anchored at the current slide's center.
  const animateZoom = useCallback(
    (targetSlide: SlideDefinition, newZoom: number) => {
      const el = canvasSurfaceRef.current;
      if (!el) return;

      const center = getSlideCenter(targetSlide);
      const offsets = computeOffsets(viewportWidth, viewportHeight, center, newZoom);

      gsap.to(el, {
        scale: newZoom,
        x: offsets.x,
        y: offsets.y,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [viewportWidth, viewportHeight, canvasSurfaceRef]
  );

  // --- Space+drag panning ---
  const panBaseRef = useRef<{ x: number; y: number; scale: number } | null>(null);

  const panStart = useCallback(() => {
    const el = canvasSurfaceRef.current;
    if (!el) return;
    if (tlRef.current) { tlRef.current.kill(); isAnimatingRef.current = false; }
    panBaseRef.current = {
      x: gsap.getProperty(el, 'x') as number,
      y: gsap.getProperty(el, 'y') as number,
      scale: gsap.getProperty(el, 'scale') as number,
    };
  }, [canvasSurfaceRef]);

  const panBy = useCallback((dx: number, dy: number) => {
    const el = canvasSurfaceRef.current;
    if (!el || !panBaseRef.current) return;
    const base = panBaseRef.current;
    gsap.set(el, {
      x: base.x + dx,
      y: base.y + dy,
      scale: base.scale,
    });
  }, [canvasSurfaceRef]);

  const panEnd = useCallback(
    (targetSlide: SlideDefinition) => {
      panBaseRef.current = null;
      const el = canvasSurfaceRef.current;
      if (!el) return;
      const z = manualZoomRef.current;
      const center = getSlideCenter(targetSlide);
      const offsets = computeOffsets(viewportWidth, viewportHeight, center, z);
      gsap.to(el, {
        scale: z,
        x: offsets.x,
        y: offsets.y,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [viewportWidth, viewportHeight, canvasSurfaceRef, manualZoomRef]
  );
  // --- End panning ---

  return { transitionTo, jumpTo, animateZoom, panStart, panBy, panEnd, isAnimating: isAnimatingRef };
}
