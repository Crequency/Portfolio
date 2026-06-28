import { Download, Upload, HardDrive, Shield } from 'lucide-react';
import type { SlideContentProps } from './types';

export function ImportExportSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><Download className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">数据导入导出与备份</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Download className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">JSON 导出</h3>
            <p className="text-muted-foreground">将完整的项目和服务配置导出为标准 JSON 文件。方便分享给团队成员或迁移到新机器。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Upload className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">导入（合并 / 替换）</h3>
            <p className="text-muted-foreground">支持两种导入模式：合并模式保留现有数据并添加新条目，替换模式完全覆盖当前配置。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><HardDrive className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">自动轮转备份</h3>
            <p className="text-muted-foreground">每次修改数据时自动创建备份（data.json.bak.1 ~ .bak.5），原子写入防止文件损坏。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
