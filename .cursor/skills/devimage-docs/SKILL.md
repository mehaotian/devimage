---
name: devimage-docs
description: >-
  Updates DevImage VitePress documentation site (apps/docs) and syncs API
  examples with NestJS routes. Use when writing user-facing docs, migration
  guides, quick-start, API reference pages, README, or docs/ planning markdown.
  Must follow markdownlint conventions (tables, links, code fences).
---

# DevImage 文档维护

> **Markdown 格式**：写任何 `.md` 前先读
> [devimage-markdown](../devimage-markdown/SKILL.md)
> （表格 compact 风格、代码块语言、链接规范）。

## 文档分层

| 类型 | 路径 | 受众 |
| ------ | ------ | ------ |
| 用户 API 文档 | `apps/docs/` | 开发者用户 |
| 产品规划 | `docs/` | 团队 / AI 上下文 |

## 新增 API 文档流程

1. 在 `apps/docs/api/{resource}.md` 创建页面
2. 结构：概述 → 路由表 → Query 参数 → HTML/JS 示例 → 响应头 → Phase 标注
3. 更新 `apps/docs/.vitepress/config.ts` sidebar
4. 在 `apps/docs/guide/quick-start.md` 加一行示例
5. 若涉及迁移，更新 `apps/docs/migrate/`

## 示例 URL 规范

- 开发：`http://localhost:3000`
- 生产：`https://cdn.devimage.cn`
- 文档中写：`http://localhost:3000`（本地开发默认）
- **表格内** URL 用尖括号：`<http://localhost:3000>`（避免 MD034）

## 迁移文档模板

```markdown
| 原服务 | 原 URL | DevImage |
| -------- | -------- | ---------- |
| picsum | `/800/600` | `/800/600` |
```

## 本地预览

```bash
pnpm dev:docs
# http://localhost:5173
```

## 与 API 同步

改路由后必须同步文档，避免文档漂移。对照 [竞品URL与API对照表.md](../../docs/竞品URL与API对照表.md)。

## 提交前 Markdown 检查

```bash
npx --yes markdownlint-cli2 \
  "apps/docs/api/*.md" "apps/docs/guide/*.md" \
  "apps/docs/migrate/*.md" "apps/docs/index.md"
```

重点：MD060 表格空格、MD040 代码块语言、MD034 表格裸链接。详见 [devimage-markdown](../devimage-markdown/SKILL.md)。
