import { Hash, Shuffle, FileSearch } from 'lucide-react';
import type { SlideContentProps } from './types';

export function ChaosSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <Hash className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">端口号的地狱</h2>
      </div>

      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5">
            <Shuffle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">记不住的端口号</h3>
            <p className="text-muted-foreground">
              React 在 3000？后端在 8080？数据库在 5432？Redis 在 6379？
              每个项目使用不同端口组合，靠记忆完全不现实。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5">
            <FileSearch className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">反复检查</h3>
            <p className="text-muted-foreground">
              翻 package.json scripts、查 netstat 输出、试错端口号……
              这些机械操作频繁打断开发心流。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-destructive/20 p-2 shrink-0 mt-0.5">
            <Hash className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">手动杀进程</h3>
            <p className="text-muted-foreground">
              kill -9 成为日常命令。有时杀错进程，引发连锁问题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
