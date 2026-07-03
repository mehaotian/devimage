# 竞品 URL 与 API 对照表

> 用于 DevImage 路由设计、picsum 兼容层、文档示例对齐。  
> 基准域名（规划）：`https://cdn.devimage.cn` · API 文档：`https://devimage.cn`

---

## 1. 合成占位图（色块 + 文字）

| 竞品 | URL 模式 | 示例 | DevImage 兼容路由 | 优先级 |
| ------ | ---------- | ------ | ------------------- | -------- |
| placehold.co | `/{w}x{h}` | `https://placehold.co/600x400` | `GET /{w}/{h}` 或 `GET /{w}x{h}` | P0 |
| placehold.co | 自定义色 | `/600x400/EEE/31343C?text=Hello` | `GET /{w}/{h}?bg=eee&fg=31343C&text=Hello` | P0 |
| placehold.co | 格式 | `/600x400.webp` | `GET /{w}/{h}.webp` | P1 |
| dummyimage.com | `/{w}x{h}/{bg}/{fg}` | `/800x600/000/fff` | 同上 query 参数 | P1 |
| placeholders.dev | query | `?width=350&height=150&text=Hello` | 支持 query 别名 | P2 |
| z.wiki | `/{w}x{h}+修饰` | `/512x256+border+cross?text=wiki` | `GET /{w}/{h}?border=1&cross=1` | P2 |
| wenjiangs.com | query | `?w=200&h=100&bc=409eff&tc=fff` | `w/h/bg/fg/text` 别名 | P2 |
| toolapi.cc | query | `?w=400&h=200&t=占位` | 同上 | P3 |

### DevImage 推荐 canonical URL

```base
# 主路由（picsum 风格斜杠）
GET https://cdn.devimage.cn/800/600

# placehold 风格（可选别名）
GET https://cdn.devimage.cn/800x600?text=Banner&bg=409eff&fg=ffffff

# 格式后缀
GET https://cdn.devimage.cn/800/600.webp
GET https://cdn.devimage.cn/800/600.svg
```

---

## 2. 真实照片占位（picsum 类）

| 竞品 | URL 模式 | 示例 | DevImage 路由 | 优先级 |
| ------ | ---------- | ------ | --------------- | -------- |
| picsum.photos | 随机 | `/800/600` | `GET /photo/800/600` 或兼容 `/800/600?type=photo` | P2 |
| picsum.photos | seed | `/seed/demo/800/600` | `GET /seed/{seed}/{w}/{h}` | P2 |
| picsum.photos | 固定 ID | `/id/237/800/600` | `GET /id/{id}/{w}/{h}` | P2 |
| picsum.photos | 灰度 | `?grayscale` | `?grayscale=1` | P3 |
| picsum.photos | 模糊 | `?blur=2` | `?blur=2` | P3 |
| picsum.photos | 列表 | `/v2/list?page=1&limit=30` | `GET /v2/list` | P3 |
| picsum.photos | 详情 | `/id/0/info` | `GET /id/{id}/info` | P3 |

### picsum 兼容层（降低迁移成本）

```base
# 完全兼容模式（Phase 2，需配置 ENABLE_PICSUM_COMPAT=true）
GET https://cdn.devimage.cn/800/600          → 等同 /photo/800/600
GET https://cdn.devimage.cn/seed/app/800/600
GET https://cdn.devimage.cn/id/237/800/600
```

---

## 3. 头像占位

| 竞品 | URL 模式 | 示例 | DevImage 路由 | 优先级 |
| ------ | ---------- | ------ | --------------- | -------- |
| DiceBear | style + seed | `api.dicebear.com/10.x/lorelei/svg?seed=Felix` | `GET /avatar/{seed}/{size}` | P1 |
| DiceBear | 多风格 | `/10.x/{style}/svg?seed=` | `GET /avatar/{style}/{seed}/{size}` | P2 |
| UI Avatars | initials | `ui-avatars.com/api/?name=John+Doe` | `GET /avatar/{name}/{size}?mode=initials` | P1 |

### DevImage 推荐

```base
GET https://cdn.devimage.cn/avatar/张三/128
GET https://cdn.devimage.cn/avatar/lorelei/user-123/64.svg
GET https://cdn.devimage.cn/avatar/John%20Doe/48?mode=initials&bg=6366f1
```

---

## 4. 场景占位（差异化）

| 场景 | 国内现状 | DevImage 路由 | 优先级 |
| ------ | ---------- | --------------- | -------- |
| 404 页面 | 组件库内置 SVG | `GET /scene/404` 或 `GET /404` | P1 |
| 空状态 | Ant Design Empty 等 | `GET /scene/empty?variant=no-data` | P1 |
| 网络错误 | 各组件库分散 | `GET /scene/error?variant=network` | P2 |
| 骨架屏背景 | 无统一服务 | `GET /skeleton/{w}/{h}` | P2 |

```base
GET https://cdn.devimage.cn/scene/404?w=800&h=600
GET https://cdn.devimage.cn/scene/empty?variant=search
GET https://cdn.devimage.cn/skeleton/375/812
```

---

## 5. 码形占位（伪 QR · 伪条码 · 差异化）

| 场景 | 国内现状 | DevImage 路由 | 优先级 |
| ------ | ---------- | --------------- | -------- |
| 支付 / 登录 mock | 静态 PNG 或组件库 | `GET /qr/:seed/:size` | P1 |
| 列表骨架「码」形 | 无统一服务 | `GET /qr/demo/128` | P1 |
| 物流 / 收银 mock | 假 EAN 条纹图 | `GET /barcode/:seed/:w/:h` | P1 |
| 样式 | 圆角模块、配色 | `?fg=&bg=&accent=&radius=` | P2 |

```base
GET https://cdn.devimage.cn/qr/checkout/256
GET https://cdn.devimage.cn/qr/demo/128.webp
GET https://cdn.devimage.cn/barcode/sku-mock/320/80?variant=ean13
```

> **边界**：以上均为 **不可扫描** 占位；真实 QR API（URL 传 `data`）不在 DevImage 占位范围，见 [码形占位规划 §8](./伪二维码占位规划.md)。

---

## 6. Mock 数据 API

| 竞品 | 模式 | 示例 | DevImage 路由 | 优先级 |
| ------ | ------ | ------ | --------------- | -------- |
| JSONPlaceholder | REST | `GET /posts/1` | `GET /mock/posts/1` | P1 |
| JSONPlaceholder | 嵌套 | `GET /posts/1/comments` | `GET /mock/posts/1/comments` | P2 |
| JSONPlaceholder | 写操作 | POST/PUT/DELETE | 返回 fake 成功（不落库） | P2 |
| Mocky | 自定义 | 需创建 | Phase 3 用户自定义 | P4 |

### DevImage Mock 资源（一期内置）

| 资源 | 路由 |
| ------ | ------ |
| 用户 | `GET /mock/users`、`/mock/users/:id` |
| 文章 | `GET /mock/posts`、`/mock/posts/:id` |
| 商品 | `GET /mock/products?count=10` |
| 分页 | `GET /mock/users?_page=1&_limit=10` |

---

## 7. 响应头与缓存策略（对标最佳实践）

| 类型 | Cache-Control | Content-Type |
| ------ | --------------- | -------------- |
| SVG 合成图 | `public, max-age=31536000, immutable`（带 seed） | `image/svg+xml` |
| 随机合成图 | `public, max-age=3600` | `image/svg+xml` |
| 缓存照片 | `public, max-age=31536000, immutable` | `image/webp` |
| Mock JSON | `public, max-age=300` | `application/json` |
| 头像 seed 固定 | `public, max-age=31536000, immutable` | `image/svg+xml` |

---

## 8. 参数命名统一规范

| 语义 | DevImage 主参数 | 兼容别名 |
| ------ | ----------------- | ---------- |
| 宽度 | `w`（query）或 path | `width` |
| 高度 | `h`（query）或 path | `height` |
| 背景色 | `bg` | `bc`, `bgColor` |
| 文字色 | `fg` | `tc`, `textColor` |
| 文字 | `text` | `t` |
| 格式 | 路径后缀 `.webp/.svg/.png` | `format` query |
| 种子 | path `/seed/{seed}/` | — |

---

## 9. 迁移对照速查

| 原 URL | DevImage 替换 |
| -------- | --------------- |
| `picsum.photos/800/600` | `cdn.devimage.cn/photo/800/600` |
| `placehold.co/600x400` | `cdn.devimage.cn/600/400` |
| `placehold.co/600x400?text=Hi` | `cdn.devimage.cn/600/400?text=Hi` |
| `jsonplaceholder.typicode.com/posts/1` | `cdn.devimage.cn/mock/posts/1` |
| `api.dicebear.com/10.x/lorelei/svg?seed=x&size=48` | `cdn.devimage.cn/avatar/lorelei/x/48` |

---

## 10. 版本与 OpenAPI

- API 版本前缀（管理类）：`/v1/...`
- 图片 CDN 路径：**不加版本号**（URL 稳定优先，类似 picsum）
- OpenAPI 文档：`https://devimage.cn/openapi.json`（NestJS Swagger 生成）
