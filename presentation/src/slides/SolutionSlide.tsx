import { FolderCheck, Shield, Eye, Zap } from 'lucide-react';
import type { SlideContentProps } from './types';

export function SolutionSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2">
          <FolderCheck className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Portfolio — 你的端口管理中心</h2>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center">
          <div className="rounded-full bg-accent p-3"><Shield className="h-6 w-6 text-muted-foreground" /></div>
          <h3 className="font-semibold">端口登记</h3>
          <p className="text-xs text-muted-foreground">集中管理所有项目的端口分配</p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center">
          <div className="rounded-full bg-accent p-3"><Zap className="h-6 w-6 text-green-400" /></div>
          <h3 className="font-semibold">存活检测</h3>
          <p className="text-xs text-muted-foreground">每 10 秒自动检测端口运行状态</p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center">
          <div className="rounded-full bg-accent p-3"><Eye className="h-6 w-6 text-muted-foreground" /></div>
          <h3 className="font-semibold">冲突预警</h3>
          <p className="text-xs text-muted-foreground">分配端口时即时警告冲突</p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center">
          <div className="rounded-full bg-accent p-3"><FolderCheck className="h-6 w-6 text-muted-foreground" /></div>
          <h3 className="font-semibold">一键打开</h3>
          <p className="text-xs text-muted-foreground">从仪表盘直接打开项目/IDE/终端</p>
        </div>
      </div>
      <div className="text-center mt-6">
        <p className="text-lg text-muted-foreground">一个本地 Web 应用，无需数据库，JSON 文件持久化，<span className="text-primary font-semibold">即刻启动</span></p>
      </div>
    </div>
  );
}
