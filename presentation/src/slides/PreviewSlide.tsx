import { MonitorPlay, ExternalLink, FolderOpen, Power } from 'lucide-react';
import type { SlideContentProps } from './types';

export function PreviewSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><MonitorPlay className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">实时预览与快速打开</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><MonitorPlay className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">内嵌预览面板</h3>
            <p className="text-muted-foreground">通过子域名反向代理（p3000.localhost → localhost:3000），在仪表盘中直接预览你的 Web 服务。支持 WebSocket 代理。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Power className="h-5 w-5 text-green-400" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">节能模式</h3>
            <p className="text-muted-foreground">非活跃时显示静态截图（html-to-image），悬浮时切换到实时 iframe。节省资源，不影响开发效率。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><FolderOpen className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">一键打开项目</h3>
            <p className="text-muted-foreground">
              在 <span className="text-primary font-mono">文件管理器</span> / <span className="text-primary font-mono">VS Code</span> / <span className="text-primary font-mono">终端</span> 中打开项目目录。WSL 路径自动转换。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
