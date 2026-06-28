import { Globe, Languages, Moon } from 'lucide-react';
import type { SlideContentProps } from './types';

export function I18nSlide({ isActive: _isActive }: SlideContentProps) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="brand-gradient rounded-lg p-2"><Globe className="h-6 w-6 text-white" /></div>
        <h2 className="text-3xl font-bold tracking-tight">国际化：三种语言</h2>
      </div>
      <div className="flex-1 flex items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8">
          <span className="brand-gradient-text text-4xl font-bold">EN</span>
          <span className="text-xl font-semibold">English</span>
          <span className="text-xs text-muted-foreground">默认语言</span>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8 ring-2 ring-primary/20">
          <span className="brand-gradient-text text-4xl font-bold">ZH</span>
          <span className="text-xl font-semibold">简体中文</span>
          <span className="text-xs text-muted-foreground">完整翻译</span>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8">
          <span className="brand-gradient-text text-4xl font-bold">JA</span>
          <span className="text-xl font-semibold">日本語</span>
          <span className="text-xs text-muted-foreground">完整翻译</span>
        </div>
      </div>
      <div className="text-center mt-6 space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Languages className="h-4 w-4" />
          <span>基于 react-i18next · 语言偏好保存在 localStorage</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Moon className="h-4 w-4" />
          <span>亮色 / 暗色 / 跟随系统 三种主题模式</span>
        </div>
      </div>
    </div>
  );
}
