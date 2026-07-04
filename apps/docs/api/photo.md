# 真实照片占位

**真实感照片占位**：写进 `<img src="…">` 就能用，无需单独配置图床。

- **固定**：同一链接始终同一张图（适合商品详情、Banner）
- **随机**：每次打开可能不同（适合列表、瀑布流）

用法与 [纯色占位](/api/placeholder)、[seed 占位](/api/placeholder#seed) 相同。使用规范见 [公平使用](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<PhotoPlayground />

<!-- markdownlint-enable MD033 -->

---

## 示例

### 商品主图（固定）

```html
<img src="http://localhost:3000/photo/400/400?scene=product&seed=product-5" />
```

### 资讯列表（随机）

每次刷新可能换一张，URL 里不要加 `seed`：

```html
<img src="http://localhost:3000/photo/320/200?scene=news" />
```

### 首页 Banner（固定）

```html
<img src="http://localhost:3000/photo/1200/400?scene=banner&seed=hero-1" />
```

### 指定题材（可选）

试玩区展开 **更多选项**，可按「美食」「咖啡」等题材筛选：

```html
<img src="http://localhost:3000/photo/640/480?cat=美食&seed=banner-1" />
```

---

## 用途一览

试玩里「用途」下拉与下表对应（URL 参数为 `scene`）：

| 用途 | scene | 适合页面 |
| ------ | ------ | ------ |
| 商品 | `product` | 电商主图、商品卡片 |
| 餐饮 | `food` | 餐厅、外卖 |
| 新闻资讯 | `news` | 资讯列表、头条 |
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

---

## 参数参考

`GET /photo/:width/:height`

| 参数 | 说明 |
| ------ | ------ |
| scene | 用途（见上表），与 cat 二选一 |
| cat | 具体题材（中文，如 `美食`），与 scene 二选一 |
| seed | 有则固定；省略则随机 |
| grayscale | `1` 灰度 |
| blur | 1–10 模糊 |
| format | `webp`（默认）`jpeg` `png` |

宽、高范围 **10–4000**，与 [占位图](/api/placeholder) 相同。

---

## 其他

- 从 picsum 迁移：[从 picsum 迁移](/migrate/from-picsum)
- 使用 DevImage [Mock 数据](/api/mock) 时，商品/资讯等图片地址已自动指向本服务
