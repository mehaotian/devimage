# 占位图 API

返回指定宽高的合成占位图。默认 SVG；可用路径后缀或 `format` 输出 WebP / PNG。无 `bg` 时背景色随机；`/seed/...` 在相同 seed 下配色固定。

兼容 [placehold.co](https://placehold.co) 的 `宽x高` 与路径配色写法，见下文。使用规范见 [使用规范](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<PlaceholderPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /:width/:height`

### 参数

| 参数 | 位置 | 必填 | 说明 |
| ------ | ------ | ------ | ------ |
| width | path | 是 | 10–4000 |
| height | path | 是 | 10–4000 |
| text | query | 否 | 显示文字，默认 `宽×高`；最长 50 字符。别名 `t` |
| bg | query | 否 | 背景色 hex，不含 `#`。别名 `bc` |
| fg | query | 否 | 文字色 hex，不含 `#`。别名 `tc` |
| format | query | 否 | `svg`（默认）\| `webp` \| `png` |
| border | query | 否 | 边框宽度 0–20；`1` / `true` 视为 2px |
| borderColor | query | 否 | 边框色 hex |
| cross | query | 否 | 对角线标记 `0` \| `1` |
| style | query | 否 | `solid`（默认）\| `pattern` |
| pattern | query | 否 | `style=pattern` 时指定纹理 id |

### 示例

```html
<img src="https://cdn.devimg.cn/800/600" alt="placeholder" />
<img src="https://cdn.devimg.cn/400/300?text=Hero&bg=3b5bdb&fg=ffffff" alt="hero" />
<img src="https://cdn.devimg.cn/800/600.webp" alt="webp" />
<img src="https://cdn.devimg.cn/800/600?format=webp" alt="webp query" />
<img src="https://cdn.devimg.cn/800/600?border=2&cross=1" alt="border" />
<img src="https://cdn.devimg.cn/800/600?style=pattern" alt="pattern" />
```

### placehold 兼容

| 形式 | 示例 |
| ------ | ------ |
| `宽x高` | `/800x600` |
| 路径配色 | `/800/600/eee/fff` 或 `/800x600/eee/fff` |
| 显式 SVG | `/800/600.svg` |
| 栅格后缀 | `/800x600.webp` |

```html
<img src="https://cdn.devimg.cn/800x600?text=Banner" alt="banner" />
<img src="https://cdn.devimg.cn/800/600/409eff/ffffff?text=Banner" alt="banner" />
```

从 placehold 迁移见 [从 placehold 迁移](/migrate/from-placehold)。

### 响应

- 默认 `Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=3600`

### 栅格输出（WebP / PNG）

| 方式 | 示例 | Content-Type |
| ------ | ------ | ------ |
| WebP 后缀 | `/800/600.webp` | `image/webp` |
| PNG 后缀 | `/800/600.png` | `image/png` |
| Query | `/800/600?format=webp` | `image/webp` |

- 栅格化宽、高各自上限 **1024**；更大尺寸请使用 SVG
- 栅格输出限流 **60 次/分钟/IP**

---

## `GET /seed/:seed/:width/:height`

相同 seed 与尺寸始终返回相同配色。支持与上一节相同的 query 与 `.webp` / `.png` 后缀。

```html
<img src="https://cdn.devimg.cn/seed/demo/800/600" alt="seed" />
<img src="https://cdn.devimg.cn/seed/demo/800/600.webp" alt="seed webp" />
```

### 响应头

- `Cache-Control: public, max-age=31536000, immutable`
