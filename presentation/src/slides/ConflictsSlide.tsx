import { AlertOctagon, XCircle, ShieldAlert } from 'lucide-react';
import type { SlideContentProps } from './types';

export function ConflictsSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <AlertOctagon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">端口冲突的噩梦</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-destructive/20 p-2 shrink-0 mt-0.5">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">启动失败</h3>
            <p className="text-muted-foreground">两个项目都配置了 3000 端口。后启动的那个失败，报错信息晦涩难懂。你花了 10 分钟才明白是端口冲突。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-yellow-500/20 p-2 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">反复发生</h3>
            <p className="text-muted-foreground">这不是偶发事件。对于同时维护 5+ 个项目的开发者来说，端口冲突<span className="text-yellow-400 font-semibold"> 每周发生数次</span>，每次都要手动排查解决。</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-xl text-muted-foreground">你需要在<span className="text-primary font-semibold"> 分配端口时就发现冲突</span></p>
        </div>
      </div>
    </div>
  );
}
