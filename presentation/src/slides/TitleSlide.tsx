import type { SlideContentProps } from './types';

export function TitleSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Logo hexagon */}
      <div className="mb-8 brand-gradient rounded-2xl p-[2px] brand-glow">
        <div className="bg-background rounded-2xl p-6">
          <svg
            width="96"
            height="96"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <path
              d="M256 40L452 148V364L256 472L60 364V148L256 40Z"
              fill="url(#title-logo-grad)"
              stroke="white"
              strokeOpacity="0.15"
              strokeWidth="8"
            />
            <circle cx="256" cy="256" r="72" fill="white" fillOpacity="0.18" />
            <circle cx="256" cy="256" r="40" fill="white" fillOpacity="0.9" />
            <defs>
              <linearGradient
                id="title-logo-grad"
                x1="60"
                y1="40"
                x2="452"
                y2="472"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <h1 className="text-5xl font-bold tracking-tight mb-4">
        <span className="brand-gradient-text">Portfolio</span>
      </h1>

      <p className="text-2xl text-muted-foreground mb-8 max-w-lg">
        Local Port Management, Simplified
      </p>

      <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-6 py-3 text-lg font-mono text-muted-foreground">
        <span className="text-primary">npx portfolio-local</span>
      </div>
    </div>
  );
}
