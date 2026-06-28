import { Heart, Github, ExternalLink } from 'lucide-react';
import type { SlideContentProps } from './types';

export function ThankYouSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-10">
      <div className="mb-8 brand-gradient rounded-2xl p-[2px] brand-glow">
        <div className="bg-background rounded-2xl p-6">
          <Heart className="h-16 w-16 text-[#7C3AED]" fill="#7C3AED" />
        </div>
      </div>

      <h2 className="text-4xl font-bold tracking-tight mb-4">
        <span className="brand-gradient-text">Thank You</span>
      </h2>

      <p className="text-xl text-muted-foreground mb-10 max-w-lg">
        Portfolio — 让本地端口管理不再混乱
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
          <Github className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">github.com/crequency/Portfolio</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">npm: portfolio-local</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Generated with Claude Code
      </p>
    </div>
  );
}
