# 使用规范与公平使用

DevImage（图即）是面向开发者的**占位资源 CDN**。MVP 阶段**源站不设硬限流**，但仍请遵守下列规范，避免滥用影响服务稳定性。

> 未来可能按 API Key / 路由分级启用限额，变更将提前在文档公告。

---

## 推荐用法

| 场景 | 推荐方式 |
| ------ | ---------- |
| 占位图、头像、场景图 | 浏览器或 `<img>` **直连** CDN URL |
| 固定 UI 回归 | 使用 `/seed/...` 或头像固定 `style + seed` |
| Mock 数据 | 开发环境 `fetch` 一次并**本地缓存** |
| 生产环境 | 走 CDN 域名 `cdn.devimage.cn`，利用缓存 |

```html
<img src="http://localhost:3000/avatar/devimg/Luna/128?text=0" />
<img src="http://localhost:3000/seed/demo/800/600" />
```

---

## 不推荐 / 禁止的用法

| 行为 | 原因 |
| ------ | ------ |
| **服务端统一代理**所有图片请求 | 所有流量来自单一 IP，延迟高且易触发未来限额 |
| 每用户随机 seed、从不复用 | CDN 无法缓存，成本与延迟上升 |
| 对 Mock 接口**高频轮询** | JSON 走源站，/faker 有 CPU 开销 |
| 单页加载数百张**不同 URL** 占位图 | 请求数异常，影响源站与其他用户 |
| 爬取、压测、批量下载 | 违反公平使用原则 |

---

## 缓存说明

| 路由 | Cache-Control | 说明 |
| ------ | ------------- | ------ |
| `/avatar/:style/:seed/:size` | immutable, 1y | 同一 URL 可长期缓存 |
| `/seed/:seed/:w/:h` | immutable, 1y | 同上 |
| `/:w/:h` | max-age=3600 | 随机色块，短缓存 |
| `/mock/*` | 视实现 | 建议客户端缓存 |

---

## 限额（当前与规划）

| 阶段 | 源站限流 | 说明 |
| ------ | ---------- | ------ |
| **MVP（当前）** | **未启用** | 依赖 CDN + 公平使用规范 |
| 二期 `/photo` | 规划更严 | COS 流量成本高 |
| 三期 Freemium | 按 API Key 分级 | 见 [Freemium 模型](https://github.com/devimage/devimage/blob/main/docs/Freemium定价与成本模型.md) |

生产环境建议在 **CDN / WAF** 层配置 DDoS 防护，与业务限额分离。

---

## 相关文档

- [头像许可与致谢](/guide/avatar-licenses)
- [头像 API](/api/avatar)
- [功能一览](/guide/dev-spec)
