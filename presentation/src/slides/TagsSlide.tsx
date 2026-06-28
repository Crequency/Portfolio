import { Tags, Palette, Filter } from 'lucide-react';
import type { SlideContentProps } from './types';

export function TagsSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><Tags className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">标签系统：随心组织</h2>
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Palette className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">自定义颜色标签</h3>
            <p className="text-muted-foreground">为每个标签选择独立的十六进制颜色。亮色/暗色主题下自动计算可读的前景色和背景色，类似 GitHub 标签风格。</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border bg-card p-5">
          <div className="rounded-full bg-accent p-2 shrink-0 mt-0.5"><Filter className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <h3 className="font-semibold text-lg mb-1">侧边栏过滤</h3>
            <p className="text-muted-foreground">标签在侧边栏中显示，支持拖拽重新排序。点击标签即可过滤显示匹配项目。结合搜索栏，快速定位目标服务。</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed'].map((c) => (
            <div key={c} className="w-8 h-8 rounded-full border-2 border-border" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
