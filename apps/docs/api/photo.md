# 真实图库 API

CC0 精选照片（当前 **8132** 张），语义与 **占位图 / 头像一致**：**seed 确定性选图，无 seed 随机**。原图存 COS，API 仅通过 `cos_key` 读取。

Mock JSON 内 `products.image`、`posts.cover` 使用 `seed=product-{id}` / `seed=news-{id}`，不再使用 `?id=`。

## 图库试玩 {#试玩}

Playground 分三个 Tab：**快速试玩**（scene / cat + seed）、**目录**、**代码参考**。

<!-- markdownlint-disable MD033 -->

<PhotoPlayground />

<!-- markdownlint-enable MD033 -->

---

## 选取语义（与占位图统一）

| 参数 | 行为 | Cache-Control |
| ------ | ------ | ------------- |
| 有 `seed` | 同 seed + 同 scene/cat → **永远同一张**（允许不同 seed 碰撞） | `immutable` |
| 无 `seed` | 每次请求从池内 **随机** 一张 | `max-age=60, must-revalidate` |
| `?id=` | **已废弃**，返回 400，请改用 `seed` | — |

```html
<!-- 确定性（Mock 商品 5 号封面） -->
<img src="http://localhost:3000/photo/400/400?scene=product&seed=product-5" />

<!-- 随机（每次可能不同） -->
<img src="http://localhost:3000/photo/800/600?scene=news" />

<!-- 中文分类 + seed -->
<img src="http://localhost:3000/photo/640/480?cat=美食&seed=banner-1" />
```

---

## 双层目录

| 层级 | 参数 | 语言 | 说明 |
| ------ | ------ | ------ | ------ |
| scene | `?scene=product` | **英文 slug** | 业务场景池，Mock 默认映射 |
| cat | `?cat=美食` | **中文 slug** | 82 个采集分类 |

scene 与 cat **二选一**。

---

## scene 场景目录（英文 slug · 中文 label）

完整 JSON：`GET /photo/scenes`

| slug | label | Mock 字段 |
| ------ | ------ | ------ |
| `product` | 商品 | `products.image` |
| `food` | 餐饮 | `restaurants.image` |
| `news` | 新闻资讯 | `posts.cover` |
| `article` | 文章博客 | — |
| `travel` | 出行 | `trips.image` |
| `hotel` | 酒店民宿 | `hotels.image` |
| `banner` | 首页轮播 | — |
| `social` | 社交动态 | — |
| `education` | 教育 | — |
| `health` | 健康医疗 | — |
| `realestate` | 房产家居 | — |
| `business` | 商务金融 | — |
| `game` | 游戏 | — |
| `promo` | 促销活动 | — |
| `gallery` | 图集混排 | — |

---

## cat 分类目录（中文 slug · tier 分组）

完整 JSON：`GET /photo/categories`

| tier | 英文 | 代表 cat |
| ------ | ------ | ------ |
| `A-product` | Product | 电商主图、服装、手机 |
| `B-food` | Food | 美食、咖啡、餐饮门店 |
| `C-content` | Content | 新闻、人物、书籍 |
| `D-travel` | Travel | 旅行、飞机、汽车 |
| `E-vertical` | Vertical | 室内、商务、医院 |
| `F-decor` | Decor | 纹理、天空、3DRender |

---

## `GET /photo/:w/:h`

| 参数 | 说明 |
| ------ | ------ |
| scene | 英文 scene slug |
| cat | 中文分类 slug |
| seed | 确定性选图；**省略则随机** |
| grayscale | `1` 灰度 |
| blur | 1–10 模糊 |
| format | `webp`（默认）`jpeg` `png` |

---

## picsum 迁移（目录专用，非占位主力）

| 路由 | 说明 |
| ------ | ------ |
| `GET /id/:id/:w/:h` | 按 manifest 全局 id（picsum 兼容） |
| `GET /id/:id/info` | 元信息 JSON |
| `GET /v2/list` | 分页列表 |

---

## 本地开发（无 CDN）

1. `apps/api/.env` 配置 COS 密钥与 `COS_REGION`
2. `pnpm dev` → API `<http://localhost:3000>` · 文档 `<http://localhost:5173/api/photo>`
