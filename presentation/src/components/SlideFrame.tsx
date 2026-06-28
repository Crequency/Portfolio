import type { ReactNode } from 'react';
import type { SlideDefinition } from '@/lib/slideRegistry';
import { getSlideCenter, SLIDE_WIDTH, SLIDE_HEIGHT } from '@/lib/canvas';

interface SlideFrameProps {
  slide: SlideDefinition;
  isActive: boolean;
  slideWidth: number;
  slideHeight: number;
  children: ReactNode;
}

export function SlideFrame({ slide, isActive, slideWidth, slideHeight, children }: SlideFrameProps) {
  const center = getSlideCenter(slide);
  const scaleX = slideWidth / SLIDE_WIDTH;
  const scaleY = slideHeight / SLIDE_HEIGHT;

  return (
    <div
      className="absolute rounded-lg border bg-card flex flex-col overflow-hidden"
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        left: center.centerX - SLIDE_WIDTH / 2,
        top: center.centerY - SLIDE_HEIGHT / 2,
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: 'center center',
        boxShadow: isActive
          ? '0 0 40px rgba(79, 70, 229, 0.25), 0 0 80px rgba(124, 58, 237, 0.12)'
          : '0 0 0 transparent',
        transition: 'box-shadow 0.3s ease',
        opacity: isActive ? 1 : 0.4,
      }}
    >
      <div className="slide-content flex-1">{children}</div>
    </div>
  );
}
