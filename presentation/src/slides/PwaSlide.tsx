import { Monitor, MonitorCheck, Cpu } from 'lucide-react';
import type { SlideContentProps } from './types';

export function PwaSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><Monitor className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">跨平台 & PWA 支持</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><MonitorCheck className="h-5 w-5 text-green-400" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">安装为独立应用</h3>
            <p className="text-muted-foreground">PWA 支持，可安装为独立窗口运行。拥有自己的图标、主题色（Indigo #4F46E5）和离线能力。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Cpu className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">全平台端口检测</h3>
            <p className="text-muted-foreground">Linux 使用 ss -tlnp，macOS 使用 lsof -i，Windows 使用 netstat -ano。TCP 连接作为降级回退方案。</p>
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border px-3 py-1 font-medium">Windows</span>
            <span className="rounded-full border px-3 py-1 font-medium">macOS</span>
            <span className="rounded-full border px-3 py-1 font-medium">Linux</span>
            <span className="rounded-full border px-3 py-1 font-medium">WSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
