# AGENTS.md — astro-blog-shokax（给自动化 Coding Agent）

本文件定义你在此仓库工作的最小安全边界与执行流程。

## 1. 运行环境与总原则

- 运行时与包管理器：**Bun**（`packageManager: bun@1.3.6`）
- 默认沟通语言：**中文**（输出与代码注释优先中文）
- 优先使用仓库脚本，不要自创命令
- 路由要求：`trailingSlash: "always"`（内部链接保留尾 `/`）
- 不要随意偏离现有架构（Astro + Svelte 5 + UnoCSS + Pagefind）

## 2. 常用命令（精确可执行）

### 安装

```bash
bun install
```

### 本地开发

```bash
bun run dev
```

### 构建与预览

```bash
# 仅站点构建
bun run build:site

# 仅索引（Pagefind）
bun run build:index

# 完整生产构建（site + index）
bun run build

# 预览
bun run preview
```

### 类型/内容检查、Lint、格式化

```bash
bun run check
bun run lint
bun run format
```

### 测试（重点：单文件）

```bash
# 全量测试
bun run test

# 单文件测试（推荐精确路径）
bun test ./src/toolkit/posts/generateTagCloud.test.ts

# 单文件 + 名称过滤
bun test ./src/toolkit/posts/generateTagCloud.test.ts -t "pattern"
```

说明：`-t/--test-name-pattern` 用于匹配 describe/test 名称组合。

### E2E 与性能（按需）

```bash
# Playwright 浏览器依赖
bunx playwright install --with-deps chromium

# E2E 套件
bun run e2e:smoke
bun run e2e:critical
bun run e2e:regression

# Lighthouse CI
bunx --bun lhci autorun --config=.lighthouserc.json
```

## 3. 代码风格（必须遵循）

### Imports

- 常规源码优先 `@/` 别名导入（`tsconfig.json`、`astro.config.mjs` 已配置）
- **`uno.config.ts` 必须用相对路径导入 `src/theme.config`**
- 不要在 `uno.config.ts` 里改成 `@/`，这是项目明确约束

### TypeScript / 类型

- 项目基于 `astro/tsconfigs/strict`，保持严格类型
- 新增结构优先 `interface` / `type` 显式建模
- 公共函数写清返回类型
- 避免无必要 `any` / 类型逃逸

### 命名

- Svelte 组件：`PascalCase.svelte`
- 函数与变量：`camelCase`
- 类型与接口：`PascalCase`
- 测试文件：`*.test.ts`（紧邻或对应模块目录）

### 格式化与 Lint

- 格式化：`oxfmt`（`bun run format`）
- Lint：`oxlint --type-aware --type-check --fix`（`bun run lint`）
- 有代码改动后至少执行：
  1. `bun run format`
  2. `bun run lint`
  3. 相关测试（必要时 `bun run check`）

### 错误处理

- 跨端逻辑先做环境检测（`window/document/globalThis`）
- 致命条件 `throw new Error(...)`
- 可恢复路径可 `try/catch` 后返回可判定结果
- 禁止无语义吞错（空 `catch`）

### 注释

- 默认中文注释
- 注释解释“为什么”，不是简单复述代码
- 公共 API 可用 JSDoc 描述参数和返回值

## 4. 仓库结构与关键约束

- App Shell：`src/layouts/Layout.astro`
- 路由：`src/pages/**`
- 文章页生成：`src/pages/posts/[...slug].astro`
- URL 模式：`/posts/<post.id>/`
- 分页约定：
  - 第 1 页：`/`（`src/pages/index.astro`）
  - 第 2..N 页：`/page/<n>/`（`src/pages/page/[page].astro`）
- 搜索使用 Pagefind；改文章页/搜索 DOM 时保留 `data-pagefind-body` 标记

## 5. UnoCSS 与图标

- UnoCSS 配置在 `uno.config.ts`
- 图标类约定：`i-ri-*`
- safelist 从主题配置派生；改导航/侧边栏图标时注意同步

## 6. 来自 Copilot/Cursor 的规则合并

### Copilot（`.github/copilot-instructions.md`）

- 默认中文输出与中文注释
- 不要新增“工作总结 Markdown 报告”文件
- 若新增依赖，必须说明：包名、用途、使用范围
- 改动后运行 `bun run format` 和 `bun run lint`，并修复新增问题
- Svelte 5 交互代码遵循现有 runes 风格（`$state/$props/$effect`）

### Cursor

- 当前仓库未发现 `.cursor/rules/` 或 `.cursorrules`
- 若未来新增 Cursor 规则，更新本文件并保持一致

## 7. Agent 标准执行清单（提交前）

```bash
# 安装
bun install

# 质量门禁
bun run format
bun run lint

# 受影响检查
bun run check
bun test ./src/toolkit/posts/generateTagCloud.test.ts -t "pattern"

# 需要时做全量验证
bun run test
bun run build
```

遵循本文件可最大化与 CI/现有维护习惯保持一致，降低回归风险。
