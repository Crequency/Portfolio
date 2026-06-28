import { useState, useEffect, useCallback } from 'react';

export interface CanvasSize {
  width: number;
  height: number;
}

export function useCanvasSize(): CanvasSize {
  const [size, setSize] = useState<CanvasSize>(() => computeSize());

  const handleResize = useCallback(() => {
    setSize(computeSize());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return size;
}

function computeSize(): CanvasSize {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Slide area takes at most 85% of viewport width
  let width = vw * 0.85;
  // And at most ~62% of viewport height (leaving room for notes)
  const maxHeight = vh * 0.62;

  // 16:9 aspect ratio
  let height = width * (9 / 16);

  // If height exceeds max, constrain by height instead
  if (height > maxHeight) {
    height = maxHeight;
    width = height * (16 / 9);
  }

  // Ensure minimum width
  if (width < 640) {
    width = 640;
    height = width * (9 / 16);
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}
