import { Rocket, Terminal, Zap } from 'lucide-react';
import type { SlideContentProps } from './types';

export function QuickStartSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">一行命令，即刻启动</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="rounded-xl border bg-card p-8 w-full max-w-lg">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Terminal className="h-4 w-4" />
            <span className="text-sm font-mono">terminal</span>
          </div>
          <div className="text-2xl font-mono text-primary">$ npx portfolio-local</div>
        </div>

        <div className="flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/20 p-1">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm">零配置</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/20 p-1">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm">无需数据库</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/20 p-1">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm">开箱即用</span>
          </div>
        </div>
      </div>
    </div>
  );
}
