# 功能与分期规划

> 完整规格见仓库 [`docs/完整开发文档.md`](https://github.com/devimage/devimage/blob/main/docs/完整开发文档.md)

DevImage 是国内开发者的**零配置占位 CDN**，URL 可直接用于 `<img src>` 和 `fetch()`。

---

## 分期总览

| 阶段 | 目标 | 核心能力 |
| ------ | ------ | ---------- |
| **MVP（已完成）** | 基础占位 CDN | 合成占位、头像、场景文案、Mock、伪码 |
| **功能补全一期** | picsum 替代 + 纯程序增强 | `/photo` 73 分类、骨架屏、placehold parity |
| **功能补全二期** | 设计素材依赖 | scene 插画 Composer（**暂缓**） |
| **三期** | 产品化 | API Key、Freemium、Mock 完整 REST |
| **四期** | 平台化 | 图标 / Lottie / 音效 / 团队库 |

> 详细排期见仓库 [`docs/占位与场景差异化规划.md`](https://github.com/devimage/devimage/blob/main/docs/占位与场景差异化规划.md)。

---

## 一期（当前）✅

### 合成占位图

| 路由 | 参数 | 说明 |
| ------ | ------ | ------ |
| `GET /:w/:h` | `text`, `bg`, `fg` | 随机色块 SVG |
| `GET /seed/:seed/:w/:h` | 同上 | 固定 seed，每次相同 |

- 尺寸：10–4000
- 颜色：hex 不含 `#`
- 文字：最长 50 字符

### 头像

| 路由 | 参数 | 说明 |
| ------ | ------ | ------ |
| `GET /avatar/:style/:seed/:size` | `bg`, `fg` | 图即风格 + 三方接入（45 种） |
| `GET /avatar/styles` | — | 含 `engine` / `license` |

中文首字：`/avatar/devimg/张三/128`

文档试玩：各 API 页内嵌 Playground；规范见 [使用规范](/guide/fair-use)。

### 场景图

| 路由 | variant | 说明 |
| ------ | --------- | ------ |
| `GET /scene/:variant` | `404` `empty` `network` `search` | 场景 SVG |
| `GET /404` | — | 快捷 404 |

Query：`w`（默认 800）、`h`（默认 600）、`theme`、`title`、`subtitle`、`accent`、`seed`

### Mock 数据

| 路由 | Query | 响应 |
| ------ | ------- | ------ |
| `GET /mock/users` | `count` 或 `_page`/`_limit` | 用户数组 |
| `GET /mock/users/:id` | — | 单个用户（id 1–100） |
| `GET /mock/posts` | `count` 或 `_page`/`_limit` | 文章数组 |
| `GET /mock/posts/:id` | — | 单篇文章 |
| `GET /mock/products` | `count` 或 `_page`/`_limit` | 商品数组 |
| `GET /mock/products/:id` | — | 单个商品 |

### 系统

| 路由 | 说明 |
| ------ | ------ |
| `GET /health` | 健康检查 |
| `GET /api/docs` | Swagger 文档 |

**源站限流**：MVP **未启用**（见 [使用规范](/guide/fair-use)）；三期规划 API Key 分级

---

## 功能补全一期（当前实施）📋

> **原则**：不依赖设计 / AI 素材。**骨架屏 + 占位先动**。
> 场景插画 Composer **二期 B**；图库 `/photo` **二期 A**（COS 未上传）。

| 功能 | 路由 | 优先级 |
| ------ | ------ | -------- |
| 骨架屏 | `GET /skeleton/:w/:h` | **P0** ⭐ |
| placehold 别名 | `/800x600`、路径配色、`?border=1` | **P0** ⭐ |
| 占位 pattern | `?style=pattern` | P0 |
| scene 文案增强 | `?theme`、`?title`、`?subtitle`、`?seed` | **P1** ✅ |
| Mock 分页 / 单条 | `?_page`、`/mock/posts/:id` | **P1** ✅ |

---

## 功能补全二期 A（图库 · COS 上传后）📋

| 功能 | 路由 |
| ------ | ------ |
| 真实照片 73 分类 | `GET /photo/:w/:h?cat=` |
| 固定照片 / 列表 | `/id/:id/:w/:h`、`/v2/list` |
| Mock 商品图联动 | products.image → photo URL |

---

## 功能补全二期 B（场景插画 · 暂缓）📋

| 功能 | 说明 |
| ------ | ------ |
| Scene Composer + figures/props 部件 | 需设计 / AI 素材验收通过 |
| `/scene/:variant/:seed` 插画级输出 | 依赖 Composer |
| `/scene/styles` | 场景目录 JSON |

---

## 已提前完成（原二期部分）✅

- 占位图 WebP / PNG 栅格
- Mock posts / products
- 伪 QR / 伪条码（`/qr`、`/barcode`）

---

## 三期 📋

- API Key 与 Freemium 分层
- Mock POST/PUT/DELETE（fake 成功）
- 资源型拼接风格 `devimage-cn`（PNG manifest）
- 嵌套 Mock（comments 等）

---

## 四期 🔮

- 图标 / Lottie / 音效 CDN
- 团队私有资源库
- B2B 私有化部署

---

## 实现状态速查

| 模块 | 一期 | 当前代码 |
| ------ | ------ | ---------- |
| 合成占位 | ✅ | ✅ |
| 头像 | ✅ | ✅ |
| 场景 | ✅ | ✅（文案 query + seed 调色板） |
| Mock | ✅ | ✅（分页 + 单条 posts/products） |
| 骨架屏 | 功能补全一期 | ✅ |
| 占位 parity/pattern | 功能补全一期 | ✅ |
| 真实照片 | 功能补全二期 A | ❌ |
| 占位 WebP/PNG | MVP | ✅ |
| scene 插画 Composer | 功能补全二期 B | ❌ 暂缓 |
| API Key | 三期 | ❌ |

---

## 示例

```html
<img src="http://localhost:3000/800/600" />
<img src="http://localhost:3000/seed/demo/800/600" />
<img src="http://localhost:3000/avatar/devimg/Luna/128?text=0" />
<img src="http://localhost:3000/avatar/rings/Luna/128" />
<img src="http://localhost:3000/scene/404" />
```

```javascript
const users = await fetch('http://localhost:3000/mock/users').then(r => r.json());
```
