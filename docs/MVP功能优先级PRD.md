# MVP 功能优先级 PRD（2 周版）

> 产品定位：**国内开发者的零配置占位 CDN**  
> 目标：替代 picsum 慢的问题，并提供场景化占位扩展  
> 周期：14 天 · 单人/小团队

---

## 1. 目标与成功指标

### 1.1 北极星

开发者复制一行 URL，在国内 `<200ms` 内看到占位图或 Mock JSON。

### 1.2 2 周成功标准

| 指标 | 目标 |
| ------ | ------ |
| P0 路由全部可用 | 100% |
| 文档站可公网访问 | ✅ |
| picsum/placehold 核心 URL 有对照文档 | ✅ |
| 腾讯云部署完成 | ✅ |
| 合成图 P95 响应 | < 50ms（源站） |
| 单元测试覆盖核心生成逻辑 | ≥ 80% |

---

## 2. 用户故事

| 角色 | 故事 | 验收 |
| ------ | ------ | ------ |
| 前端开发者 | 我在写列表页，需要 200×200 占位图 | `GET /200/200` 返回 SVG |
| 前端开发者 | 我需要固定 seed 便于 UI 回归 | `/seed/demo/800/600` 每次相同 |
| 全栈开发者 | 后端未就绪，我要 Mock 用户列表 | `GET /mock/users` 返回 JSON 数组 |
| 移动端开发者 | 需要中文头像占位 | `/avatar/张三/128` 显示首字 |
| 技术写作者 | 我要在文档里展示 API 示例 | 文档站有交互示例和复制按钮 |

---

## 3. 功能分期

### Phase 0 — 工程基础（Day 1–2）

| 任务 | 产出 |
| ------ | ------ |
| monorepo 初始化 | pnpm workspace |
| NestJS API 骨架 | Fastify 适配器、健康检查 |
| VitePress 文档站 | 首页 + 快速开始 |
| Docker / PM2 部署脚本 | 腾讯云轻量可部署 |
| COS Bucket 初始化 | photo 缓存目录 `photos/` |
| Cursor rules + skills | AI 协作规范 |

### Phase 1 — P0 核心（Day 3–7）

| 功能 | 路由 | 说明 |
| ------ | ------ | ------ |
| 随机色块占位 | `GET /:w/:h` | SVG 生成，尺寸校验 10–4000 |
| seed 固定占位 | `GET /seed/:seed/:w/:h` | 确定性颜色 + 可选文字 |
| 自定义参数 | `?text=&bg=&fg=` | hex 颜色校验 |
| 格式后缀 | `/:w/:h.svg` `.webp` | 一期 SVG 必做，webp Phase 1.5 |
| 字母头像 | `GET /avatar/:name/:size` | 中文首字支持 |
| Mock 用户 | `GET /mock/users` | faker 风格 10 条 |
| Mock 单条 | `GET /mock/users/:id` | id 1–100 |
| 健康检查 | `GET /health` | 部署探针 |

### Phase 2 — P1 差异化（Day 8–11）

| 功能 | 路由 | 说明 |
| ------ | ------ | ------ |
| 404 场景图 | `GET /scene/404` | SVG 模板 |
| 空状态 | `GET /scene/empty` | variant: no-data / search / network |
| Mock 文章/商品 | `/mock/posts` `/mock/products` | 扩展资源 |
| picsum 兼容层 | `/photo/:w/:h` | COS 缓存精选图包（非实时 Pexels） |
| 用量统计（内存） | 响应头 `X-DevImage-Requests` | 为 Freemium 预留 |
| 码形占位 | `GET /qr/:seed/:size`、`GET /barcode/:seed/:w/:h` | 伪 QR / 伪条码，不可扫描；详见 [码形占位规划](./伪二维码占位规划.md) |
| ~~头像多风格扩展~~ | — | **已告一段落**（59 风格 + Playground）；暂不再新增 |

### Phase 3 — P2  polish（Day 12–14）

| 功能 | 说明 |
| ------ | ------ |
| 文档站完善 | 全部 API 页 + 迁移指南 |
| OpenAPI / Swagger | `/api/docs` |
| 速率限制 | 免费 100 req/min/IP |
| 错误页 | 统一 400/404 JSON + SVG |
| README + 掘金宣发素材 | 对外发布 |

### 明确不做（2 周内）

- Pexels 实时搜索
- 用户注册 / 付费系统
- 图标 / Lottie / 音效
- **真实可扫描 QR / 条形码**（URL 传 payload 动态生成；见 [码形占位规划 §8](./伪二维码占位规划.md)）
- **场景插画 AI/设计部件**（试产未达标；改 [功能补全二期](./占位与场景差异化规划.md)，见 [场景部件交付规范](./场景部件交付规范.md)）
- 国内 ICP 备案（腾讯云 CDN 必需，建议 D7 启动）
- 分布式多节点

### 功能补全一期（2026-07 修订，不限 2 周）

> 详见 [占位与场景差异化规划](./占位与场景差异化规划.md) §13。

| 优先级 | 功能 |
| -------- | ------ |
| **P0** ⭐ | `/skeleton/:w/:h` 骨架屏 |
| **P0** ⭐ | placehold parity（`800x600`、路径配色、pattern） |
| P1 | Mock 分页、scene 文案 query |
| — | `/photo` + 图库 → **二期 A**（COS 未上传） |

---

## 4. 技术任务拆解

### 4.1 API 模块划分（NestJS）

```text
apps/api/src/
├── placeholder/     # /:w/:h, /seed/
├── avatar/          # /avatar/ ✅ 告一段落，暂不再扩展
├── code/            # /qr · /barcode · /code/styles（见 docs/伪二维码占位规划.md）
├── scene/           # /scene/, /404
├── mock/            # /mock/*
├── photo/           # /photo/ (Phase 2)
├── common/          # 校验、缓存头、限流
└── health/
```

### 4.2 文档站页面结构

```text
apps/docs/
├── index.md           # 产品介绍
├── guide/quick-start.md
├── api/placeholder.md
├── api/avatar.md
├── api/mock.md
├── api/scene.md
├── migrate/from-picsum.md
└── migrate/from-placehold.md
```

---

## 5. 非功能需求

| 项 | 要求 |
| ---- | ------ |
| 安全 | 尺寸上限 4000；text 长度 ≤ 50；防 SSRF（photo 模块） |
| 可观测 | 结构化日志（pino）；请求 ID |
| CORS | `Access-Control-Allow-Origin: *` |
| 可用性 | 腾讯云轻量单节点目标 99.5% |

---

## 6. 里程碑日历

| 日期 | 里程碑 |
| ------ | -------- |
| D2 | 仓库可 `pnpm dev` 同时起 API + 文档 |
| D5 | P0 路由全部通，文档快速开始上线 |
| D8 | 头像 + Mock + 场景占位 |
| D11 | photo 缓存 + picsum 迁移文档 |
| D14 | 腾讯云部署 + CDN/COS + 限流 + 对外发布 |

---

## 7. 风险与缓解

| 风险 | 缓解 |
| ------ | ------ |
| NestJS 对 SVG 直出过重 | 使用 Fastify 适配器；生成逻辑纯函数 |
| 文档站与 API 域名分离 | 文档示例用环境变量 `VITE_API_BASE` |
| 真实照片版权 | Phase 2 仅用 CC0 精选包，不用实时 Pexels |
| 国内速度未达预期 | 腾讯云 CDN + COS 同地域；合成 SVG 仍走 API 实时生成 |

---

## 8. 发布清单

- [ ] 所有 P0 路由测试通过
- [ ] 腾讯云轻量 + COS + CDN 配置完成
- [ ] README 含 3 行 quick start
- [ ] CHANGELOG v0.1.0
