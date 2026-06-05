# Portfolio — 本地项目端口管理工具

## 痛点来源

当你在本地同时开发多个项目时，每个项目都有好几个端口需要占用，部分项目也需要固定端口才能正常运行。
每次启动项目之前都要检查端口占用情况，或者修改项目配置文件中的端口号，既麻烦又容易出错。

## 解决方案

Portfolio 是一个本地运行的 Web Server 应用，提供一个树状可视化页面，展示和管理本地项目的端口分配情况。
用户通过这个页面记录项目信息、各服务占用的端口号，并可以检测对应进程是否存活，避免端口冲突和混乱。

---

## 技术选型

| 层级         | 选择                                      | 理由                                         |
| ------------ | ----------------------------------------- | -------------------------------------------- |
| **Frontend** | React 18 + TypeScript + Vite              | 组件化开发，TypeScript 类型安全，Vite 构建快 |
| **Backend**  | Node.js + Express + TypeScript            | 前后端统一语言，Express 成熟稳定             |
| **UI 组件**  | shadcn/ui (Radix + Tailwind)              | 现代、可定制、无第三方依赖捆绑               |
| **i18n**     | `react-i18next` + `i18next`               | 多语言国际化，生态成熟，React 集成好         |
| **数据存储** | 本地 JSON 文件 (`~/.portfolio/data.json`) | 零依赖，可手动编辑，数据对用户透明           |
| **进程检测** | `ss` / `lsof` 系统命令                    | 检测指定端口是否有进程在监听                 |
| **包管理**   | pnpm (workspace monorepo)                 | 高效磁盘利用，原生 monorepo 支持             |

### 开发与生产模式

- **开发模式**：`packages/web` 通过 Vite 启动 dev server（默认 `:5173`），
  `packages/server` 通过 `tsx watch` 启动（默认 `:3000`）。
  Vite 配置 proxy 将 `/api/*` 请求转发到 Express 后端，避免跨域问题。
- **生产模式**：Express 在启动时 serve `packages/web` 构建产物（`dist/` 目录），
  前后端统一由端口 `35688` 提供服务。
- **PWA 安装**：生产模式支持 PWA，用户通过 Chrome 打开一次后即可「安装」为独立窗口，
  获得无浏览器地址栏的桌面应用体验。安装后可通过桌面快捷方式 / 开始菜单直接启动。

## 功能需求

### F1 — 项目管理 (CRUD)

用户可以对「项目」进行增删改查。项目代表用户本地的一个开发项目。

**项目字段：**

| 字段          | 类型            | 必填 | 说明                             |
| ------------- | --------------- | ---- | -------------------------------- |
| `id`          | string (UUID)   | 是   | 唯一标识                         |
| `name`        | string          | 是   | 项目名称                         |
| `description` | string          | 否   | 项目描述                         |
| `path`        | string          | 否   | 本地文件系统路径（用于快速打开） |
| `tags`        | string[]        | 否   | 自定义标签，用于筛选分组         |
| `services`    | Service[]       | 否   | 该项目下的服务列表               |
| `createdAt`   | ISO 8601 string | 是   | 创建时间                         |
| `updatedAt`   | ISO 8601 string | 是   | 最后修改时间                     |

### F2 — 服务/端口管理 (CRUD)

每个项目下可以有多个「服务」（Service），每个服务占用一个端口。

**服务字段：**

| 字段            | 类型            | 必填 | 说明                                              |
| --------------- | --------------- | ---- | ------------------------------------------------- |
| `id`            | string (UUID)   | 是   | 唯一标识                                          |
| `name`          | string          | 是   | 服务名称（如 "web", "api", "db"）                 |
| `port`          | number          | 是   | 占用端口号 (1-65535)                              |
| `description`   | string          | 否   | 服务描述                                          |
| `status`        | enum            | 否   | `running` / `stopped` / `unknown`（默认 unknown） |
| `lastCheckedAt` | ISO 8601 string | 否   | 上次检测时间                                      |

### F3 — 树状可视化

首页以树状结构展示「项目 → 服务 → 端口」的层级关系：

```
[+] MyBlog
  |-- web     (frontend) -> :3000 [running]
  |-- api     (backend)  -> :8080 [stopped]
  +-- db      (database) -> :5432 [unknown]
[+] ECommerce
  |-- admin      -> :3001 [running]
  +-- storefront -> :3002 [running]
```

- 状态用颜色区分：运行中(绿)、已停止(红)、未知(灰)
- 支持展开/折叠项目和服务的子项
- 支持按项目名、服务名、端口号搜索过滤
- 支持按标签筛选项目
- 默认排序：项目按 `updatedAt` 降序（最近修改的在前），服务按端口号升序

### F4 — 进程存活检测

- 用户可手动触发检测（单个服务 / 单个项目 / 全部项目）
- 也可设置定时自动检测（默认关闭，可配置间隔）
- 检测方式：通过 `ss -tlnp` 或 `lsof -i :PORT` 检查端口是否有进程监听
- 检测结果更新 `status` 和 `lastCheckedAt` 字段
- 支持前端显示「上次检测时间」和检测结果

### F5 — 端口冲突检测

- **前端校验**：在添加/修改服务表单中，实时检查端口是否与已有记录重复，冲突时给出警告提示（黄色高亮）
- **API 校验**：POST/PUT 服务时，后端同样检查端口是否已被其他服务占用，
  返回 `warning: "port_conflict"` 字段及冲突的服务信息，但不阻止保存（因为可能是同一服务的不同项目）
- 仪表盘上对冲突端口使用视觉标识（黄色边框/背景）标记

### F6 — 数据导入/导出

- 导出：将全部数据导出为 JSON 文件下载
- 导入：从 JSON 文件导入数据（合并或覆盖可选）
- 备份：自动在每次修改前备份当前数据（保留最近 5 个备份 `data.json.bak.{1-5}`）

### F7 — 快速打开项目

当项目填写了 `path` 字段时，支持从 Portfolio 页面快速打开该项目：

- 点击「打开」按钮调用后端 API `POST /api/projects/:id/open`
- 后端根据运行环境选择打开方式：
  - WSL/Linux: `xdg-open` 打开文件管理器，或通过 `code <path>` 在 VS Code 中打开
  - macOS: `open <path>`
  - Windows (WSL 互通): `explorer.exe <wslpath>` 或 `code <path>`
- 前端提供配置选项选择默认打开方式（文件管理器 / VS Code / 终端）

---

## 数据模型（JSON Schema）

```jsonc
{
  "version": 1, // 数据格式版本（便于未来迁移）
  "projects": [
    {
      "id": "uuid-xxxx",
      "name": "MyBlog",
      "description": "个人博客项目",
      "path": "/home/user/projects/my-blog",
      "tags": ["personal", "react"],
      "services": [
        {
          "id": "uuid-yyyy",
          "name": "web",
          "port": 3000,
          "description": "React 前端开发服务器",
          "status": "running",
          "lastCheckedAt": "2026-06-05T10:30:00+08:00",
        },
      ],
      "createdAt": "2026-06-01T09:00:00+08:00",
      "updatedAt": "2026-06-05T10:30:00+08:00",
    },
  ],
}
```

存储路径：`~/.portfolio/data.json`

### 数据版本迁移

`version` 字段用于标识数据格式版本。当未来 schema 变更时：

- 后端启动时检测 `version`，如果低于当前期望版本，自动执行迁移逻辑
- 迁移规则以纯函数实现：`migrate_v1_to_v2(data) → data`，链式调用
- 迁移前自动创建备份（`data.json.bak.migrate-{version}`），迁移失败时回滚
- MVP 阶段仅需支持 `version: 1`，迁移逻辑预留接口即可

---

## API 设计

### 通用规范

**基础路径：** `/api`

**响应格式：**

```jsonc
// 成功
{ "ok": true, "data": { ... } }

// 错误
{ "ok": false, "error": { "code": "NOT_FOUND", "message": "Project not found" } }
```

**错误码：**

| HTTP Status | `error.code`       | 说明                                 |
| ----------- | ------------------ | ------------------------------------ |
| 400         | `BAD_REQUEST`      | 请求参数校验失败                     |
| 404         | `NOT_FOUND`        | 资源不存在                           |
| 409         | `PORT_CONFLICT`    | 端口已被其他服务占用（警告，不阻止） |
| 422         | `VALIDATION_ERROR` | 请求体格式/必填字段校验失败          |
| 500         | `INTERNAL_ERROR`   | 服务器内部错误                       |

### Projects

| Method   | Path                     | 说明                                            |
| -------- | ------------------------ | ----------------------------------------------- |
| `GET`    | `/api/projects`          | 获取所有项目（支持 `?search=` 和 `?tag=` 过滤） |
| `POST`   | `/api/projects`          | 创建项目                                        |
| `GET`    | `/api/projects/:id`      | 获取单个项目详情                                |
| `PUT`    | `/api/projects/:id`      | 更新项目                                        |
| `DELETE` | `/api/projects/:id`      | 删除项目（含其下所有服务）                      |
| `POST`   | `/api/projects/:id/open` | 在文件管理器/IDE中打开项目路径                  |

**POST /api/projects** — Request Body:

```jsonc
{
  "name": "MyBlog", // required, non-empty
  "description": "...", // optional
  "path": "/home/user/...", // optional
  "tags": ["personal"], // optional, default []
}
```

**PUT /api/projects/:id** — Request Body: 同 POST，所有字段可选（部分更新）。

### Services

| Method   | Path                              | 说明     |
| -------- | --------------------------------- | -------- |
| `POST`   | `/api/projects/:id/services`      | 添加服务 |
| `PUT`    | `/api/projects/:id/services/:sid` | 更新服务 |
| `DELETE` | `/api/projects/:id/services/:sid` | 删除服务 |

**POST /api/projects/:id/services** — Request Body:

```jsonc
{
  "name": "web", // required, non-empty
  "port": 3000, // required, 1-65535
  "description": "...", // optional
}
```

**PUT /api/projects/:id/services/:sid** — Request Body: 同 POST，所有字段可选。

### Check (进程检测)

| Method | Path                               | 说明                             |
| ------ | ---------------------------------- | -------------------------------- |
| `POST` | `/api/check`                       | 检测全部服务的端口状态           |
| `POST` | `/api/check/:projectId`            | 检测指定项目下所有服务的端口状态 |
| `POST` | `/api/check/:projectId/:serviceId` | 检测单个服务的端口状态           |

**Response:**

```jsonc
{
  "ok": true,
  "data": {
    "checked": 5,
    "results": [
      {
        "serviceId": "uuid",
        "projectId": "uuid",
        "port": 3000,
        "status": "running",
      },
    ],
  },
}
```

### Data (导入/导出)

| Method | Path          | 说明                        |
| ------ | ------------- | --------------------------- |
| `GET`  | `/api/export` | 导出全部数据为 JSON         |
| `POST` | `/api/import` | 导入 JSON 数据，body 见下方 |

**POST /api/import** — Request Body:

```jsonc
{
  "data": { "version": 1, "projects": [...] },  // required, 完整数据对象
  "mode": "merge"                                // "merge" (合并) | "replace" (覆盖), default "merge"
}
```

---

## UI 设计

### 页面结构

```
+----------------------------------------------------+
|  Portfolio                          [Settings]     |  <- Top nav
+----------------------------------------------------+
|  [Search projects/ports...]  [+ New] [Check All]   |  <- Toolbar
+-------------+--------------------------------------+
| Filter tags |                                      |
| (*) All     | [+] MyBlog                           |
| ( ) personal|   [=] web     -> :3000 [running]     |
| ( ) work    |   [=] api     -> :8080 [stopped]     |
|             |   [=] db      -> :5432 [unknown]     |
|             |                                      |
|             | [+] ECommerce                        |
|             |   [=] admin      -> :3001 [running]  |
|             |   [=] storefront -> :3002 [running]  |
|             |                                      |
+-------------+--------------------------------------+
```

### 空白状态（Empty State）

当用户首次使用、没有任何项目时，主区域不显示空白树，而是展示引导页：

```
+----------------------------------------------------+
|  Portfolio                          [Settings]     |
+----------------------------------------------------+
|  [Search projects/ports...]  [+ New] [Check All]   |
+-------------+--------------------------------------+
| Filter tags |                                      |
| (*) All     |                                      |
|             |        No projects yet               |
|             |                                      |
|             |   Start by creating your first       |
|             |   project to track its ports.        |
|             |                                      |
|             |         [+ Create Project]           |
|             |                                      |
+-------------+--------------------------------------+
```

- 引导文案和按钮支持 i18n
- 点击引导按钮与点击顶部 [+ New] 行为一致

### 交互细节

- 点击项目名展开/折叠服务列表
- 点击端口号可复制到剪贴板
- 悬停服务显示详情 tooltip（描述、上次检测时间等）
- 右键服务/项目可弹出快捷操作菜单（编辑、删除、检测状态、打开路径）
- 拖拽服务可在项目间移动

**编辑方式：**

- 创建/编辑项目或服务统一使用 **Modal 弹窗**（居中对话框），包含表单字段
- 表单校验在前端实时进行（必填检查、端口范围 1-65535），提交前二次确认
- 支持 ESC 关闭弹窗，点击遮罩不关闭（防止误操作丢失填写内容）

**删除确认：**

- 删除项目（级联删除所有服务）或删除服务时，弹出确认对话框
- 确认框展示即将删除的资源名称和影响范围（如 "Deleting this project will also remove 3 services"）
- 用户需点击「确认删除」按钮或输入项目名称确认后，才执行删除

### 状态颜色

| Status    | Color     | Icon   |
| --------- | --------- | ------ |
| `running` | green-500 | filled |
| `stopped` | red-500   | filled |
| `unknown` | gray-400  | empty  |

### UI 规范

#### U1 — Tailwind CSS

全局所有样式统一使用 Tailwind CSS utility classes 实现，不编写自定义 CSS 文件
（shadcn/ui 组件通过 Tailwind tokens 配置主题变量，同样遵循此原则）。

设计要点：

- 间距、颜色、字体大小均使用 Tailwind 设计令牌（`spacing`, `colors`, `fontSize`）
- 复杂布局优先使用 Flexbox / Grid 对应的 Tailwind utilities
- 动画与过渡效果使用 `transition-*` / `animate-*` 类
- 需要自定义样式时，扩展 `tailwind.config.ts` 的 `theme.extend`，而非覆盖 CSS

#### U2 — Light / Dark Theme

全局 UI 支持亮色（Light）与暗色（Dark）双主题，默认跟随操作系统设置。

实现方式：

- 使用 Tailwind CSS 的 `dark` mode（`class` 策略），通过 `<html class="dark">` 切换
- 主题切换按钮放在顶部导航栏，提供三种模式：`Light | Dark | System`
- 用户选择持久化到 `localStorage`，下次访问时恢复
- shadcn/ui 组件通过 CSS 变量（`--background`, `--foreground` 等）分别在 `:root` 和 `.dark` 下定义两组值
- 状态颜色在暗色主题下自动调整以保持可读性（如 `green-500` → `green-400` 提升亮度）

#### U3 — i18n 国际化

全局 UI 支持多语言，首批支持以下三种语言：

| 语言代码  | 语言               |
| --------- | ------------------ |
| `zh-Hans` | Simplified Chinese |
| `en-US`   | English (US)       |
| `ja`      | Japanese           |

实现方式：

- 使用 `react-i18next` 或 `i18next` 作为 i18n 框架
- 每种语言的翻译文件存放于 `packages/web/src/locales/{lang}/` 目录下
- 语言切换按钮放在顶部导航栏，显示当前语言标识（如 "EN", "简", "日"）
- 用户选择持久化到 `localStorage`，未选择时默认根据浏览器 `navigator.language` 匹配最接近的语言
- 所有面向用户的文本（UI 标签、提示、错误信息等）均通过 `t('key')` 获取，翻译 key 使用英文原文作为 fallback

#### U4 — PWA（Progressive Web App）

支持 PWA 安装，让 Portfolio 以独立桌面应用窗口运行：

- 配置 `manifest.json`：定义应用名称、图标、启动 URL（`/`）、独立窗口模式（`display: standalone`）
- 注册 Service Worker：缓存静态资源，支持离线展示已缓存页面
- 图标：提供 `192x192` 和 `512x512` 两种尺寸的 PNG 图标
- PWA 仅在 **生产模式**下生效（开发模式下 Service Worker 会干扰 HMR）

实现方式：

- 使用 `vite-plugin-pwa`（基于 `workbox`）自动生成 Service Worker 和 manifest
- `vite.config.ts` 中按环境条件启用：仅在 `build` 时注入 PWA 插件

---

## 非功能性需求

### N1 — 性能

- 页面首屏加载 < 1s
- API 响应时间 < 200ms
- 端口检测超时 5s（避免卡住）

### N2 — 可靠性

- JSON 文件操作使用原子写入（先写临时文件，再 rename）
- 每次修改前自动备份（保留最近 5 个备份）
- 数据格式损坏时给出明确错误提示

### N3 — 可用性

- Theme 支持见 [U2 — Light / Dark Theme](#u2--light--dark-theme)
- 支持键盘快捷键（`Ctrl+K` 全局搜索, `Ctrl+N` 新建项目, `Escape` 关闭弹窗）
- 响应式布局（桌面端优化为主，移动端基本可用）

### N4 — 可维护性

- monorepo 结构，前后端共享类型定义
- ESLint + Prettier 统一代码风格
- 前端组件采用 shadcn/ui 统一设计语言

### N5 — 测试策略

- **单元测试**：`shared` 包的类型校验工具，`server` 包的数据读写、校验、迁移逻辑
  — 使用 Vitest
- **API 集成测试**：每个 API 端点的正常和异常路径
  — 使用 Vitest + supertest
- **前端组件测试**：关键交互组件（树状列表、表单弹窗）
  — 使用 Vitest + React Testing Library
- 不追求覆盖率指标，但核心逻辑（数据读写、端口检测、冲突校验）必须有测试

### N6 — 浏览器兼容

- 主要支持 Chromium 系浏览器（Chrome / Edge / Arc 等）
- 兼容 Firefox（基本可用即可，部分 CSS 效果降级）
- 不要求支持 Safari / IE

---

## 项目结构 (Monorepo)

```
Portfolio/
├── .develop/
│   └── Requirements.md          # 本文档
├── packages/
│   ├── shared/                  # 共享类型定义
│   │   ├── src/
│   │   │   └── types.ts         # Project, Service 等类型
│   │   └── package.json
│   ├── server/                  # Express 后端
│   │   ├── src/
│   │   │   ├── index.ts         # 入口
│   │   │   ├── routes/          # API 路由
│   │   │   ├── services/        # 业务逻辑（数据读写、端口检测）
│   │   │   └── middleware/      # 中间件（错误处理等）
│   │   └── package.json
│   └── web/                     # React 前端
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/      # UI 组件
│       │   ├── hooks/           # 自定义 hooks
│       │   ├── lib/             # 工具函数
│       │   └── pages/           # 页面
│       └── package.json
├── pnpm-workspace.yaml
├── package.json                 # 根 package.json（脚本入口）
└── tsconfig.json                # 根 TypeScript 配置
```

### 启动方式

```bash
# 开发模式（前端 :5173 + 后端 :3000，Vite proxy 转发 /api）
pnpm dev

# 单独启动后端（用于调试 API）
pnpm --filter server dev

# 单独启动前端
pnpm --filter web dev

# 生产构建 + 启动（Express 统一 serve :35688）
pnpm build
pnpm start
```

启动后访问 `http://localhost:35688`，在 Chrome 地址栏右侧点击安装按钮即可将 Portfolio 安装为 PWA 独立窗口。

---

## 开发计划 (MVP)

### Phase 1 — 基础骨架

- [ ] 初始化 monorepo（pnpm workspace + TypeScript）
- [ ] shared 包：类型定义
- [ ] server 包：Express 启动 + JSON 文件读写
- [ ] web 包：Vite + React + Tailwind + shadcn/ui 初始化
- [ ] web 包：Tailwind dark mode + shadcn/ui CSS 变量主题（Light/Dark/System）
- [ ] web 包：i18n 框架搭建（`react-i18next`，三种语言文件骨架）
- [ ] 响应式布局基础（Tailwind responsive utilities）

### Phase 2 — 核心 CRUD

- [ ] Projects API (GET/POST/PUT/DELETE) + 请求校验 + 错误处理
- [ ] Services API (POST/PUT/DELETE) + 端口冲突 API 校验
- [ ] 前端项目列表 + 树状展示 + 空白状态引导页
- [ ] 前端 Modal 弹窗表单（新建/编辑项目和服务）
- [ ] 删除确认对话框

### Phase 3 — 进程检测

- [ ] 后端端口检测逻辑（ss/lsof）
- [ ] 检测 API
- [ ] 前端触发检测 + 状态展示

### Phase 4 — 增强功能

- [ ] 搜索过滤
- [ ] 标签筛选
- [ ] 端口冲突前端警告 + 高亮标识
- [ ] 数据导入/导出
- [ ] 自动备份
- [ ] 快速打开项目路径（F7）

### Phase 5 — 体验优化

- [ ] 键盘快捷键（Ctrl+K, Ctrl+N, Escape）
- [ ] 拖拽移动服务
- [ ] i18n 翻译补全（三种语言完整覆盖）
