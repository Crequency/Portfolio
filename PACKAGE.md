# npm 包发布指南

## 构建

```bash
pnpm build
```

构建产物：

- `packages/server/dist/cli/` — ncc 打包的 CLI 入口（自包含，含 express 等依赖）
- `packages/web/dist/` — Vite 构建的前端静态文件

## 本地测试

### 预览打包内容

```bash
npm pack --dry-run
```

查看哪些文件会被打包进 `.tgz`，确认 `dist/cli/` 和 `web/dist/` 都在列表中。

### 模拟用户安装

```bash
npm pack                              # → portfolio-local-x.y.z.tgz
npm i -g ./portfolio-local-*.tgz      # 全局安装本地包
portfolio                             # 启动测试
```

测试完后清理：

```bash
npm r -g portfolio-local
rm portfolio-local-*.tgz
```

### 直接运行构建产物

```bash
node packages/server/dist/cli/index.js
```

## 发布

### 首次发布

```bash
npm login               # 登录 npm 账号
pnpm build
npm publish
```

### 后续更新

```bash
pnpm build
npm version patch       # 0.1.2 → 0.1.3
npm publish

# 或手动指定版本
npm version minor       # 0.1.2 → 0.2.0
npm version major       # 0.1.2 → 1.0.0
```

## 已发布包的维护

### 弃用某个版本

```bash
npm deprecate portfolio-local@0.1.0 "This version has a bug, please upgrade"
```

### 查看包信息

```bash
npm view portfolio-local
npm view portfolio-local versions
npm view portfolio-local version   # 最新版本
```

### 撤销发布（72 小时内）

```bash
npm unpublish portfolio-local@0.1.2
```

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

| 场景               | 命令                |
| ------------------ | ------------------- |
| Bug 修复           | `npm version patch` |
| 新功能（向后兼容） | `npm version minor` |
| Breaking change    | `npm version major` |
