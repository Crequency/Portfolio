# Portfolio — Presentation

> 为 [Portfolio](https://github.com/Crequency/Portfolio) 项目录制的宣传演示页面。

## 快速开始

```bash
cd presentation
npm install
npx vite
```

浏览器访问 `http://localhost:45315/`，使用方向键导航幻灯片。

## 技术栈

| 类别 | 选择                                          |
| ---- | --------------------------------------------- |
| 框架 | React 18 + TypeScript                         |
| 样式 | Tailwind CSS 3（复用 Portfolio 暗色主题变量） |
| 动画 | GSAP 3.12                                     |
| 图标 | lucide-react                                  |
| 构建 | Vite 5                                        |

## 架构

### 画布导航系统

所有 16 张幻灯片平铺在一张虚拟大画布上，以 16:9 瓦片紧密排列（960×540 + 20px 间隙）。相机通过 GSAP 控制 `translate` + `scale` 实现视角切换。

### 页面切换动画（5 阶段）

```
Phase A: 快速缩小（0.25s, power2.inOut）
Phase B: 停留展示全景（0.40s）
Phase C: 平移至目标页（0.30s, power2.inOut）
Phase D: 停留确认位置（0.40s）
Phase E: 放大聚焦目标（0.25s, power2.inOut）
```

### 键盘操作

| 按键           | 动作                                  |
| -------------- | ------------------------------------- |
| `↓` / `Space`  | 进入子节点                            |
| `↑` / `Esc`    | 返回父节点                            |
| `←` `→`        | 兄弟节点间切换                        |
| `Home`         | 回到第一页                            |
| `End`          | 跳到最后一页                          |
| `Shift` + 拖拽 | 自由浏览大画布（松开 Shift 自动返回） |

## 功能

### 演讲者视图

- **16:9 幻灯片区域** — 纯净无遮挡，适合录屏
- **演讲者备注** — 下方可滚动区域，显示当前页讲解提示
- **导航小地图** — 可拖动、可缩放的浮动面板，展示树形网格布局，点击跳转
- **视野缩放滑块** — 0.05× ~ 2.0×，以当前页中心为锚点
- **操控提示** — 底部栏显示当前可用的方向键

### 小地图

- SVG 渲染，自动适应面板尺寸
- 坐标纸风格的网格背景 + 树形连线
- 每个卡片左上角标记序号
- 当前页高亮脉冲动画
- 拖动标题栏移动位置，拖拽右下角调整大小

### 幻灯片树形结构

```
                    [ 1  Title ]
                    /          \
         [ 2  Problem ]    [ 12  Quick Start ]
         /    |    \              |
   [ 3 ]  [ 4 ]  [ 5 ]    [ 13  Tech Stack ]
     |                            |
  [ 6  Solution ]          [ 14  Open Source ]
   /  /   |   \  \                |
 [7][8] [9] [10][11]       [ 15  Thank You ]
  |
 [16 i18n]
```

## 设计系统

完全复用 Portfolio 的暗色主题：

- **背景**: `hsl(222.2 84% 4.9%)` — 极暗石板色
- **前景**: `hsl(210 40% 98%)` — 近白色
- **品牌渐变**: `#4F46E5`（Indigo）→ `#7C3AED`（Violet）
- **卡片**: `hsl(var(--card))` + `border` + `rounded-lg`
- **字体**: 系统 UI 栈（无自定义字体）
- **圆角**: `0.5rem` 基准

## 文件结构

```
presentation/
├── README.md
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── src/
    ├── main.tsx                        # 入口
    ├── App.tsx                         # 根组件
    ├── index.css                       # 暗色主题 CSS 变量
    ├── components/
    │   ├── Presentation.tsx            # 编排器：导航 + 过渡 + 输入
    │   ├── SlideCanvas.tsx             # 视口 + 画布表面
    │   ├── SlideFrame.tsx              # 16:9 幻灯片容器
    │   ├── CanvasBackground.tsx        # 缩小时的网格背景
    │   ├── PresenterNotes.tsx          # 备注 + 操控 + 缩放栏
    │   ├── ProgressIndicator.tsx       # 幻灯片编号 + 面包屑
    │   ├── SlideMinimap.tsx            # 树形导航小地图（SVG）
    │   └── FloatingPanel.tsx           # 可拖动/缩放的浮动画板
    ├── hooks/
    │   ├── useNavigation.ts            # 树形导航状态机
    │   ├── useSlideTransition.ts       # GSAP 5 阶段过渡 + 缩放 + 平移
    │   ├── useCanvasSize.ts            # 响应式 16:9 计算
    │   └── useKeyboardNav.ts           # 键盘快捷键绑定
    ├── lib/
    │   ├── canvas.ts                   # 坐标/间距/偏移数学
    │   ├── slideRegistry.ts            # 16 张幻灯片元数据
    │   ├── slideTree.ts                # 树遍历辅助
    │   ├── componentMap.ts             # 幻灯片组件映射
    │   └── utils.ts                    # cn() 工具
    └── slides/                         # 16 张幻灯片内容组件
        ├── types.ts
        ├── TitleSlide.tsx
        ├── ProblemSlide.tsx
        ├── QuickStartSlide.tsx
        ├── ChaosSlide.tsx
        ├── LivenessSlide.tsx
        ├── ConflictsSlide.tsx
        ├── SolutionSlide.tsx
        ├── DashboardSlide.tsx
        ├── TagsSlide.tsx
        ├── PreviewSlide.tsx
        ├── ImportExportSlide.tsx
        ├── PwaSlide.tsx
        ├── I18nSlide.tsx
        ├── TechStackSlide.tsx
        ├── OpenSourceSlide.tsx
        └── ThankYouSlide.tsx
```
