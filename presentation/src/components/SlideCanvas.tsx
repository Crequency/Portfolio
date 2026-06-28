import { getSlides } from '@/lib/slideTree';
import { getCanvasBounds, SLIDE_WIDTH, SLIDE_HEIGHT } from '@/lib/canvas';
import { CanvasBackground } from './CanvasBackground';
import { SlideFrame } from './SlideFrame';

interface SlideCanvasProps {
  viewportWidth: number;
  viewportHeight: number;
  currentSlideId: string;
  surfaceRef: (el: HTMLDivElement | null) => void;
  setBackgroundRef: (el: HTMLDivElement | null) => void;
}

export function SlideCanvas({
  viewportWidth,
  viewportHeight,
  currentSlideId,
  surfaceRef,
  setBackgroundRef,
}: SlideCanvasProps) {
  const slides = getSlides();
  const bounds = getCanvasBounds(slides);

  return (
    <div
      className="relative overflow-hidden mx-auto"
      style={{
        width: viewportWidth,
        height: viewportHeight,
      }}
    >
      {/* The large canvas surface containing all slides.
          Positioned at viewport origin; GSAP controls x/y/scale via transform. */}
      <div
        ref={surfaceRef}
        className="absolute top-0 left-0"
        style={{
          width: bounds.width || viewportWidth * 3,
          height: bounds.height || viewportHeight * 3,
          transformOrigin: '0 0',
        }}
      >
        {slides.map((slide) => {
          const SlideComponent = slide.component;
          const isActive = slide.id === currentSlideId;
          return (
            <SlideFrame
              key={slide.id}
              slide={slide}
              isActive={isActive}
              slideWidth={SLIDE_WIDTH}
              slideHeight={SLIDE_HEIGHT}
            >
              <SlideComponent isActive={isActive} />
            </SlideFrame>
          );
        })}

        {/* Background grid layer */}
        <CanvasBackground setRef={setBackgroundRef} />
      </div>
    </div>
  );
}
