import type { ComponentType } from 'react';
import type { SlideContentProps } from '@/slides/types';

export interface SlideDefinition {
  id: string;
  title: string;
  notes: string;
  row: number;
  col: number;
  parentId: string | null;
  childrenIds: string[];
  component: ComponentType<SlideContentProps>;
  icon: string; // lucide icon name for breadcrumb / progress
}

// We import components lazily to avoid circular deps.
// The registry only stores metadata; components are resolved in slideTree.
export type SlideMeta = Omit<SlideDefinition, 'component'>;

export const SLIDE_METAS: SlideMeta[] = [
  {
    id: 'title',
    title: 'Portfolio — 本地端口管理仪表盘',
    notes: '大家好，今天我来介绍 Portfolio 项目。这是一个本地端口管理工具，帮助开发者在本地同时管理多个项目的端口分配。我会从问题开始，逐步展示它的功能和价值。',
    row: 0,
    col: 0,
    parentId: null,
    childrenIds: ['problem', 'quick-start'],
    icon: 'Presentation',
  },
  {
    id: 'problem',
    title: '你是否经历过端口管理的混乱？',
    notes: '先来描述问题场景。现代前端/全栈开发中，我们经常同时启动多个项目，每个项目又有多个服务。记住所有端口号几乎是不可能的。',
    row: 1,
    col: -1,
    parentId: 'title',
    childrenIds: ['chaos', 'liveness', 'conflicts'],
    icon: 'AlertTriangle',
  },
  {
    id: 'quick-start',
    title: '一行命令，即刻启动',
    notes: '在深入问题之前，先展示最简单的使用方式。只需 npx portfolio-local 就能启动。零配置，开箱即用。',
    row: 1,
    col: 1,
    parentId: 'title',
    childrenIds: ['tech-stack'],
    icon: 'Rocket',
  },
  {
    id: 'chaos',
    title: '端口号的地狱',
    notes: '管理多个项目和端口是一个普遍的痛点。你需要不断查看 netstat、检查 package.json 里的 scripts、手动杀进程来释放端口。这些琐事频繁打断开发心流。',
    row: 2,
    col: -2,
    parentId: 'problem',
    childrenIds: ['solution'],
    icon: 'Hash',
  },
  {
    id: 'liveness',
    title: '这个服务还在跑吗？',
    notes: '另一个痛点：服务可能静默崩溃了，但端口仍被占着。或者上周启动的某个后台进程还在监听某个端口，你完全忘了。这浪费了大量调试时间。',
    row: 2,
    col: -1,
    parentId: 'problem',
    childrenIds: [],
    icon: 'Activity',
  },
  {
    id: 'conflicts',
    title: '端口冲突的噩梦',
    notes: '最让人头疼的场景：两个项目试图使用同一个端口。一个启动失败，你不得不找到并杀掉占用者。这种问题每周可能发生数次。',
    row: 2,
    col: 0,
    parentId: 'problem',
    childrenIds: [],
    icon: 'AlertOctagon',
  },
  {
    id: 'solution',
    title: 'Portfolio — 你的端口管理中心',
    notes: '来到解决方案部分。Portfolio 提供了一个集中式的仪表盘，可视化地管理所有项目和它们的端口分配。关键功能：追踪服务、实时端口检测、冲突警告、标签管理、实时预览面板。',
    row: 3,
    col: -1,
    parentId: 'chaos',
    childrenIds: ['dashboard', 'tags', 'preview', 'import-export', 'pwa'],
    icon: 'FolderCheck',
  },
  {
    id: 'dashboard',
    title: '两种视图：Tree 与 Card',
    notes: 'Portfolio 提供两种视图模式。Tree 视图是层级化的项目/服务列表，详细信息一目了然。Card 视图是紧凑的网格布局，适合快速扫视状态。两种视图之间可以一键切换，偏好会被记住。',
    row: 4,
    col: -2,
    parentId: 'solution',
    childrenIds: [],
    icon: 'LayoutGrid',
  },
  {
    id: 'tags',
    title: '标签系统：随心组织',
    notes: '你可以为项目创建自定义标签，每个标签有独立的颜色。标签在侧边栏中显示，支持拖拽排序。点击标签即可过滤只显示相关项目。颜色在亮色/暗色主题下都能保持可读性。',
    row: 4,
    col: -1,
    parentId: 'solution',
    childrenIds: ['i18n'],
    icon: 'Tags',
  },
  {
    id: 'preview',
    title: '实时预览与快速打开',
    notes: 'Preview 面板可以内嵌展示你的 Web 服务，无需切换浏览器标签页。支持节能模式——悬停时截图展示，点击后激活实时 iframe。此外，一键即可在文件管理器、VS Code 或终端中打开项目目录。',
    row: 4,
    col: 0,
    parentId: 'solution',
    childrenIds: [],
    icon: 'MonitorPlay',
  },
  {
    id: 'import-export',
    title: '数据导入导出与备份',
    notes: '你的配置数据存储在 ~/.portfolio/data.json 中。支持导出为 JSON 文件，也可以导入（合并或替换模式）。每次修改数据时自动创建轮转备份，最多保留 5 份历史版本，确保数据安全。',
    row: 4,
    col: 1,
    parentId: 'solution',
    childrenIds: [],
    icon: 'Download',
  },
  {
    id: 'pwa',
    title: '跨平台 & PWA 支持',
    notes: 'Portfolio 支持安装为 PWA 独立应用窗口，有自己的图标和主题色。运行在 Windows、macOS、Linux 和 WSL 上。端口检测自动适配不同操作系统的命令（ss、lsof、netstat）。',
    row: 4,
    col: 2,
    parentId: 'solution',
    childrenIds: [],
    icon: 'Monitor',
  },
  {
    id: 'i18n',
    title: '国际化：三种语言',
    notes: '支持 English、简体中文和日本語三种语言。使用 react-i18next 实现，语言偏好保存在 localStorage 中。切换语言无需刷新页面，所有界面文字即时更新。',
    row: 5,
    col: -1,
    parentId: 'tags',
    childrenIds: [],
    icon: 'Globe',
  },
  {
    id: 'tech-stack',
    title: '技术栈一览',
    notes: '展示技术栈。前端 React 18 + TypeScript + Tailwind CSS（shadcn/ui 风格），后端 Express 4 + Node.js，monorepo 使用 pnpm workspaces，构建用 Vite。图标库 lucide-react。',
    row: 2,
    col: 1,
    parentId: 'quick-start',
    childrenIds: ['open-source'],
    icon: 'Code',
  },
  {
    id: 'open-source',
    title: '开源 & 社区',
    notes: 'Portfolio 采用 AGPL-3.0 许可证，完全开源。代码托管在 GitHub 上，欢迎 Star 和贡献。可以通过 npm 全局安装或直接使用 npx 运行。',
    row: 3,
    col: 1,
    parentId: 'tech-stack',
    childrenIds: ['thank-you'],
    icon: 'GitFork',
  },
  {
    id: 'thank-you',
    title: '感谢关注',
    notes: '结束语。回顾核心价值：零配置、实时端口检测、冲突预防、标签管理、PWA 支持。提供 GitHub 链接和 npm 包链接。Q&A 时间。感谢大家的观看！',
    row: 5,
    col: 1,
    parentId: 'open-source',
    childrenIds: [],
    icon: 'Heart',
  },
];
