import { getSlides, getSlidePath } from '@/lib/slideTree';
import type { SlideDefinition } from '@/lib/slideRegistry';

interface ProgressIndicatorProps {
  currentSlide: SlideDefinition | null;
}

export function ProgressIndicator({ currentSlide }: ProgressIndicatorProps) {
  if (!currentSlide) return null;

  const allSlides = getSlides();
  const idx = allSlides.findIndex((s) => s.id === currentSlide.id);
  const path = getSlidePath(currentSlide);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full border px-4 py-1.5 shadow-sm select-none">
      {/* Slide number */}
      <span className="font-mono tabular-nums">
        {idx + 1} / {allSlides.length}
      </span>

      <span className="text-border">|</span>

      {/* Breadcrumb path */}
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
  );
}
