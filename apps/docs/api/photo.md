# 真实照片 API

按宽高返回图库中的真实照片，用于商品主图、列表封面、Banner 等需要照片质感的占位。将 URL 写入 `<img src>` 即可。

- **固定**：带 `seed`，或使用 `/id/:id/...`，同一 URL 始终同一张
- **随机**：`/photo/:w/:h` 且省略 `seed`，每次请求可能不同

与 [合成占位图](/api/placeholder) 的路径习惯相近，但内容为照片而非色块。使用规范见 [使用规范](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<PhotoPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /photo/:width/:height`

宽、高范围 **10–4000**。`scene` 与 `cat` 指定其一即可。

| 参数 | 说明 |
| ------ | ------ |
| scene | 用途，见下表 |
| cat | 题材（中文，如 `美食`） |
| seed | 有则固定选图；省略则随机 |
| grayscale | `1` 灰度 |
| blur | 1–10 模糊 |
| format | `webp`（默认）`jpeg` `png` |

### 用途（scene）

| 用途 | scene | 常见页面 |
| ------ | ------ | ------ |
| 商品 | `product` | 电商主图、商品卡片 |
| 餐饮 | `food` | 餐厅、外卖 |
| 新闻资讯 | `news` | 资讯列表 |
| 文章博客 | `article` | 博客封面 |
| 出行 | `travel` | 行程、票务 |
| 酒店民宿 | `hotel` | 住宿详情 |
| 首页轮播 | `banner` | 宽屏 Hero |
| 社交动态 | `social` | 信息流配图 |
| 教育 | `education` | 课程封面 |
| 健康医疗 | `health` | 医疗、健身 |
| 房产家居 | `realestate` | 房源、装修 |
| 商务金融 | `business` | 企业、金融 |
| 游戏 | `game` | 游戏封面 |
| 促销活动 | `promo` | 活动 Banner |
| 通用 | `gallery` | 不限题材 |

完整题材与用途列表：

```http
GET /photo/categories
GET /photo/scenes
```

### 示例

```html
<img src="https://cdn.devimg.cn/photo/400/400?scene=product&seed=product-5" alt="product" />
<img src="https://cdn.devimg.cn/photo/320/200?scene=news" alt="news" />
<img src="https://cdn.devimg.cn/photo/1200/400?scene=banner&seed=hero-1" alt="banner" />
<img src="https://cdn.devimg.cn/photo/640/480?cat=美食&seed=banner-1" alt="food" />
```

### 响应头

- 带 `seed`：`Cache-Control: public, max-age=31536000, immutable`
- 无 `seed`：`Cache-Control: public, max-age=60, must-revalidate`
- `X-DevImage-Photo-Id`：实际选中的图库 id

---

## picsum 兼容

| 路由 | 说明 |
| ------ | ------ |
| `GET /id/:id/:width/:height` | 按图库 id 取图，可带 `grayscale`、`blur`、`format` |
| `GET /id/:id/info` | 该 id 的元信息 JSON |
| `GET /v2/list` | 列表；query：`page`、`limit`、`cat` |

```html
<img src="https://cdn.devimg.cn/id/1/800/600" alt="photo by id" />
```

路径对照见 [从 picsum 迁移](/migrate/from-picsum)。

---

## 与 Mock 的关系

[Mock 数据](/api/mock) 中的文章封面、商品图默认指向本接口；无可用照片时回退为色块占位。
