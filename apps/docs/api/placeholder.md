# 占位图 API

使用规范见 [公平使用](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<PlaceholderPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /:width/:height`

返回 SVG 占位图（默认）。需要位图时使用路径后缀或 `format` query。

### 参数

| 参数 | 位置 | 必填 | 说明 |
| ------ | ------ | ------ | ------ |
| width | path | 是 | 10–4000 |
| height | path | 是 | 10–4000 |
| text | query | 否 | 显示文字，默认 `宽×高` |
| bg | query | 否 | 背景色 hex，不含 `#` |
| fg | query | 否 | 文字色 hex，不含 `#` |
| format | query | 否 | `svg`（默认）\| `webp` \| `png` |

### 示例

```html
<img src="http://localhost:3000/800/600" />
<img src="http://localhost:3000/400/300?text=Hero&bg=6366f1&fg=ffffff" />
<img src="http://localhost:3000/800/600.webp" />
<img src="http://localhost:3000/800/600?format=webp" />
```

### 响应

- 默认 `Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=3600`

### 栅格输出（WebP / PNG）

| 方式 | 示例 | Content-Type |
| ------ | ------ | ------ |
| WebP 后缀 | `/800/600.webp` | `image/webp` |
| PNG 后缀 | `/800/600.png` | `image/png` |
| Query | `/800/600?format=webp` | `image/webp` |

规则：

- 栅格化宽、高各自上限 **1024**；更大尺寸请用 SVG
- 栅格路由源站限流 **60 次/分钟/IP**

---

## `GET /seed/:seed/:width/:height`

相同 seed 始终返回相同配色。

```html
<img src="http://localhost:3000/seed/demo/800/600" />
<img src="http://localhost:3000/seed/demo/800/600.webp" />
```

### 响应头

- SVG / 栅格：`Cache-Control: public, max-age=31536000, immutable`（seed 固定）
