# 功能与分期规划

> 完整规格见仓库 [`docs/完整开发文档.md`](https://github.com/devimage/devimage/blob/main/docs/完整开发文档.md)

DevImage 是国内开发者的**零配置占位 CDN**，URL 可直接用于 `<img src>` 和 `fetch()`。

---

## 分期总览

| 阶段 | 目标 | 核心能力 |
| ------ | ------ | ---------- |
| **一期 MVP** | 替代 picsum 慢、可公网使用 | 合成占位、头像、场景、Mock、文档 |
| **二期** | picsum 真实图 + 差异化 | `/photo`、COS 缓存、WebP、骨架屏 |
| **三期** | 产品化 | API Key、Freemium、Mock 完整 REST |
| **四期** | 平台化 | 图标 / Lottie / 音效 / 团队库 |

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

Query：`w`（默认 800）、`h`（默认 600）

### Mock 数据

| 路由 | Query | 响应 |
| ------ | ------- | ------ |
| `GET /mock/users` | `count` | 用户数组 |
| `GET /mock/users/:id` | — | 单个用户（id 1–100） |
| `GET /mock/posts` | `count` | 文章数组 |
| `GET /mock/products` | `count` | 商品数组 |

### 系统

| 路由 | 说明 |
| ------ | ------ |
| `GET /health` | 健康检查 |
| `GET /api/docs` | Swagger 文档 |

**源站限流**：MVP **未启用**（见 [使用规范](/guide/fair-use)）；三期规划 API Key 分级

---

## 二期 📋

| 功能 | 路由 |
| ------ | ------ |
| 真实照片（COS） | `GET /photo/:w/:h` |
| 固定照片 ID | `GET /id/:id/:w/:h` |
| 照片信息 | `GET /id/:id/info` |
| 照片列表 | `GET /v2/list` |
| WebP / PNG | `/:w/:h.webp` |
| 骨架屏 | `GET /skeleton/:w/:h` |
| placehold 别名 | `/800x600`、`?border=1` |
| Mock 分页 | `?_page=1&_limit=10` |

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
| 场景 | ✅ | ✅ |
| Mock | ✅ | ✅（含 posts/products） |
| 真实照片 | 二期 | ❌ |
| WebP | 二期 | ❌ |
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
