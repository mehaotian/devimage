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
| bg | query | 否 | 背景色 hex，不含 `#`（别名 `bc`） |
| fg | query | 否 | 文字色 hex，不含 `#`（别名 `tc`） |
| format | query | 否 | `svg`（默认）\| `webp` \| `png` |
| border | query | 否 | 边框宽度 0–20；`1`/`true` 为 2px |
| borderColor | query | 否 | 边框色 hex |
| cross | query | 否 | 对角线标记 `0`\|`1` |
| style | query | 否 | `solid`（默认）\| `pattern` 纹理背景 |
| pattern | query | 否 | `style=pattern` 时指定纹理 id |

### 示例

```html
<img src="http://localhost:3000/800/600" />
<img src="http://localhost:3000/400/300?text=Hero&bg=6366f1&fg=ffffff" />
<img src="http://localhost:3000/800/600.webp" />
<img src="http://localhost:3000/800/600?format=webp" />
<img src="http://localhost:3000/800/600?border=2&cross=1" />
<img src="http://localhost:3000/800/600?style=pattern" />
```

### placehold 兼容别名

| 形式 | 示例 |
| ------ | ------ |
| `宽x高` | `/800x600` |
| 路径配色 | `/800/600/eee/fff` 或 `/800x600/eee/fff` |
| 显式 SVG | `/800/600.svg` |
| 栅格后缀 | `/800x600.webp` |

```html
<img src="http://localhost:3000/800x600?text=Banner" />
<img src="http://localhost:3000/800/600/409eff/ffffff?text=Banner" />
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
