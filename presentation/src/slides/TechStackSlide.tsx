import { Code, Box, FileJson } from 'lucide-react';
import type { SlideContentProps } from './types';

const TECH = [
  { name: 'React 18', desc: 'UI 框架', color: '#61DAFB' },
  { name: 'TypeScript', desc: '类型安全', color: '#3178C6' },
  { name: 'Tailwind CSS', desc: '样式系统', color: '#06B6D4' },
  { name: 'Express 4', desc: '后端服务', color: '#888' },
  { name: 'Vite 5', desc: '构建工具', color: '#BD34FE' },
  { name: 'pnpm', desc: 'Monorepo', color: '#F69220' },
  { name: 'lucide-react', desc: '图标库', color: '#7C3AED' },
  { name: 'GSAP', desc: '动画引擎', color: '#88CE02' },
];

export function TechStackSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><Code className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">技术栈一览</h2>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-4 content-center">
        {TECH.map((t) => (
          <div key={t.name} className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
