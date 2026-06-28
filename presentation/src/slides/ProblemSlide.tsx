import { AlertTriangle, Layers } from 'lucide-react';
import type { SlideContentProps } from './types';

export function ProblemSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <AlertTriangle className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">端口管理的混乱</h2>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-8 max-w-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-accent p-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold brand-gradient-text">5+</div>
            <div className="text-sm text-muted-foreground">活跃项目</div>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-3xl font-light text-muted-foreground">×</span>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-accent p-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold brand-gradient-text">3-5</div>
            <div className="text-sm text-muted-foreground">每个项目的服务数</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl text-muted-foreground">
          你需要记住 <span className="text-primary font-bold">15-25 个端口号</span>，而且随时可能冲突
        </p>
      </div>
    </div>
  );
}
