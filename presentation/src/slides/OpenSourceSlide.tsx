import { GitFork, Star, Shield, Github } from 'lucide-react';
import type { SlideContentProps } from './types';

export function OpenSourceSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><GitFork className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">开源 & 社区</h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="font-mono text-sm">AGPL-3.0</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
            <Github className="h-5 w-5 text-muted-foreground" />
            <span className="font-mono text-sm">GitHub</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>欢迎 Star & 贡献代码</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 w-full max-w-md">
          <div className="text-sm text-muted-foreground mb-2">安装方式</div>
          <div className="space-y-3">
            <div className="rounded-md bg-secondary px-4 py-3 font-mono text-sm">
              <span className="text-muted-foreground">$ </span>
              <span className="text-primary">npm i -g portfolio-local</span>
            </div>
            <div className="rounded-md bg-secondary px-4 py-3 font-mono text-sm">
              <span className="text-muted-foreground">$ </span>
              <span className="text-primary">npx portfolio-local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
