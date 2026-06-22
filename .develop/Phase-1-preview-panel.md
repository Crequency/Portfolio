# Phase 1 — Card View Preview Panel

## 概述

在卡片视图（Card View）中，每个 Project Card 下方增加可展开/收起的预览区域。用户为每个 Project 指定一个 Service 作为预览目标，预览区域以 16:9 iframe 呈现目标页面，每 30s 自动刷新。

---

## 功能点

### F1 — 预览 Service 选择

- 在每个 Project Card 的 Service chips 区域，为每个 chip 增加一个"设为预览"按钮（或右键菜单项）
- 用户选择一个 Service 后，该 Service 的 port 作为 iframe 的 `src`（`http://localhost:PORT`）
- 选中的 Service chip 在视觉上有标识（如蓝色边框高亮）
- 选择状态持久化：Project 数据模型增加 `previewServiceId?: string` 字段
- 每个 Project 最多一个预览 Service

### F2 — 预览区域展开/折叠

- Service chips 下方增加预览 toggle 条：
  - **折叠状态**：一行带 border 的窄条，左侧显示展开图标（`ChevronDown`），右侧显示当前预览端口号或"Preview"文字
  - **展开状态**：窄条变为关闭图标（`ChevronUp`）+ "Collapse" 文字，下方撑开预览 iframe 区域
- 预览区域整体应用 `rounded-lg` 圆角
- iframe 区域底部两角（左下、右下）使用 `overflow-hidden` 做硬裁切（因为 iframe 自身无法圆角，通过外层容器 `rounded-b-lg overflow-hidden` 裁剪）
- 动画：展开/折叠使用 CSS `transition-all duration-300`

### F3 — 预览 iframe

- 宽高比：16:9 landscape 模式
- 实现：外层容器 `relative w-full`，内层 `aspect-[16/9]` 或 padding-bottom 百分比方案
- iframe `src` = `http://localhost:{port}`
- iframe `sandbox` 属性：`allow-scripts allow-same-origin`（允许页面脚本和同源访问）
- 每 30s 自动刷新：通过更新 iframe 的 `key` prop 或直接重新赋值 `src` 触发重载
- Header 右侧增加手动刷新按钮（`RefreshCw` 图标），点击立即刷新

### F4 — 工具栏全局切换按钮

- 工具栏（新建项目按钮左侧）增加按钮："Toggle Previews"
- 图标：`PanelBottom` 或 `MonitorPlay`
- 点击时：
  - 如果当前有任何预览已展开 → 全部折叠
  - 如果没有任何预览展开 → 全部展开
- 按钮状态不持久化（每次页面加载默认全部折叠）

### F5 — 自动刷新

- 仅对当前已展开的预览区域生效（折叠的不刷新，节省资源）
- 间隔：30s
- 刷新方式：修改 iframe `key` 为 `Date.now()` 强制 React 重新挂载 iframe 元素

---

## 数据模型变更

### shared/src/types.ts

```typescript
export interface Project {
  // ... existing fields ...
  previewServiceId?: string; // 新增：预览目标 Service 的 ID
}

export interface UpdateProjectBody {
  // ... existing fields ...
  previewServiceId?: string | null; // 新增，null 表示取消预览
}
```

### 后端适配

- `packages/server/src/routes/projects.ts`：PUT 端点支持 `previewServiceId` 字段
- 无需新增 API 端点

---

## 前端组件

### 新增文件

| 文件                               | 说明                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| `components/tree/PreviewPanel.tsx` | 预览面板：toggle 条 + iframe 区域 + 自动刷新 + 手动刷新按钮 |
| `hooks/usePreviewRefresh.ts`       | 30s 自动刷新 hook，接受 port 和是否展开                     |

### 修改文件

| 文件                              | 变更                                               |
| --------------------------------- | -------------------------------------------------- |
| `shared/src/types.ts`             | Project 增加 `previewServiceId`                    |
| `server/src/routes/projects.ts`   | PUT 端点支持 `previewServiceId`                    |
| `pages/Dashboard.tsx`             | 工具栏增加 toggle 按钮 + 展开状态管理 + 传递 props |
| `components/tree/ServiceCard.tsx` | 增加"设为预览"按钮 + 选中高亮                      |

---

## UI 设计

### 折叠状态

```
┌──────────────────────────────────────────────┐
│  Project Header (name, tags, actions)        │
├──────────────────────────────────────────────┤
│  [● 3000 12ms] [● 8080 5ms] [● 5432]         │  ← Service chips
├──────────────────────────────────────────────┤
│  ▼ Preview (:3000)                           │  ← Toggle bar (collapsed)
└──────────────────────────────────────────────┘
```

### 展开状态

```
┌──────────────────────────────────────────────┐
│  Project Header (name, tags, actions)        │
├──────────────────────────────────────────────┤
│  [● 3000 12ms] [● 8080 5ms] [● 5432]         │
├──────────────────────────────────────────────┤
│  ▲ Preview (:3000)                    [🔄]  │  ← Toggle bar (expanded) + refresh btn
├──────────────────────────────────────────────┤
│                                              │
│           ┌──────────────────────┐           │
│           │                      │           │
│           │       iframe         │           │  ← 16:9 landscape
│           │                      │           │
│           │                      │           │
│           └──────────────────────┘           │
│          (bottom corners clipped)            │
└──────────────────────────────────────────────┘
```

### 组件树

```
Dashboard
├── Toolbar
│   ├── [Sidebar Toggle]
│   ├── [Search Input]
│   ├── [Toggle All Previews]   ← 新增
│   ├── [View Mode Toggle]
│   └── [+ New Project]
├── Project Cards (card view)
│   └── ProjectCard (grid)
│       ├── Project Header (row 1: name + tags, row 2: count + actions)
│       ├── Service Chips (w/ "set preview" on each chip)
│       └── PreviewPanel        ← 新增
│           ├── Toggle Bar (expand/collapse + refresh btn)
│           └── iframe (16:9, auto-refresh 30s)
└── Modals
```

---

## 实现细节

### PreviewPanel.tsx

```typescript
interface PreviewPanelProps {
  port: number | null; // preview target port
  expanded: boolean; // is this panel expanded
  onToggle: () => void; // toggle expand/collapse
}

// 内部逻辑:
// - 30s setInterval → 修改 iframeKey state 触发 iframe 重挂载
// - 手动刷新按钮 → 同上
// - 仅在 expanded=true 时运行 interval（useEffect 依赖 expanded）
// - iframe sandbox="allow-scripts allow-same-origin"
// - src = `http://localhost:${port}`
```

### 样式要点

- iframe 容器：`rounded-b-lg overflow-hidden` 裁剪底部圆角
- 整体预览区域：`rounded-lg border bg-card`
- Toggle bar：`flex items-center gap-2 px-4 py-1.5 border-t cursor-pointer hover:bg-accent/50`
- iframe 容器：`relative w-full bg-black/5`，内部 `aspect-[16/9]`
- 展开动画：`transition-all duration-300`

---

## 验证

- [ ] 选择一个 running service 设为预览，展开预览面板，iframe 正确加载目标页面
- [ ] 30s 后 iframe 自动刷新
- [ ] 点击手动刷新按钮，iframe 立即刷新
- [ ] 点击工具栏 Toggle All Previews 按钮，全部展开/全部折叠
- [ ] 折叠后 iframe 不继续刷新（节省资源）
- [ ] 预览 Service 端口不可达时，iframe 显示浏览器默认错误页
- [ ] 切换视图模式后预览状态保持

---

## 依赖

- 无需新增 npm 依赖
- lucide-react 图标：`ChevronDown`, `ChevronUp`, `RefreshCw`, `MonitorPlay`
