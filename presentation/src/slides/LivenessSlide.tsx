import { Activity, Power, Clock } from 'lucide-react';
import type { SlideContentProps } from './types';

export function LivenessSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">这个服务还在跑吗？</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-destructive/20 p-2 shrink-0 mt-0.5">
            <Power className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">静默崩溃</h3>
            <p className="text-muted-foreground">服务进程崩溃了，但端口仍然被占用。你以为它在运行，其实早已死掉。结果：5 分钟 debug 后发现是僵尸进程。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">遗忘的后台进程</h3>
            <p className="text-muted-foreground">上周启动的某个 dev server 还在监听 3000 端口。你已经完全忘记了它的存在，直到新的项目启动失败。</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-xl text-muted-foreground">你需要一个<span className="text-primary font-semibold"> 实时的端口状态面板</span></p>
        </div>
      </div>
    </div>
  );
}
