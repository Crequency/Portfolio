import { LayoutGrid, LayoutList, Columns } from 'lucide-react';
import type { SlideContentProps } from './types';

export function DashboardSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><LayoutGrid className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">两种视图，一个真相</h2>
      </div>
      <div className="flex-1 flex gap-6">
        <div className="flex-1 flex flex-col items-center gap-4 rounded-lg border bg-card p-6">
          <div className="rounded-full bg-accent p-3"><LayoutList className="h-8 w-8 text-muted-foreground" /></div>
          <h3 className="font-semibold text-lg">Tree 视图</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 层级化项目/服务列表</li>
            <li>• 完整详情一目了然</li>
            <li>• 点击展开/折叠项目</li>
            <li>• 内联编辑与删除</li>
          </ul>
        </div>
        <div className="flex items-center justify-center"><Columns className="h-6 w-6 text-muted-foreground" /></div>
        <div className="flex-1 flex flex-col items-center gap-4 rounded-lg border bg-card p-6">
          <div className="rounded-full bg-accent p-3"><LayoutGrid className="h-8 w-8 text-muted-foreground" /></div>
          <h3 className="font-semibold text-lg">Card 视图</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 紧凑网格布局</li>
            <li>• 快速扫视服务状态</li>
            <li>• 悬浮显示详情 Tooltip</li>
            <li>• 彩色标签一目了然</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">一键切换，偏好持久化在 localStorage</p>
      </div>
    </div>
  );
}
