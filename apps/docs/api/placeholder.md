# 占位图 API

使用规范见 [公平使用](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<PlaceholderPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /:width/:height`

返回 SVG 占位图。

### 参数

| 参数 | 位置 | 必填 | 说明 |
| ------ | ------ | ------ | ------ |
| width | path | 是 | 10–4000 |
| height | path | 是 | 10–4000 |
| text | query | 否 | 显示文字，默认 `宽×高` |
| bg | query | 否 | 背景色 hex，不含 `#` |
| fg | query | 否 | 文字色 hex，不含 `#` |

### 示例

```html
<img src="http://localhost:3000/800/600" />
<img src="http://localhost:3000/400/300?text=Hero&bg=6366f1&fg=ffffff" />
```

### 响应

- `Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=3600`

---

## `GET /seed/:seed/:width/:height`

相同 seed 始终返回相同配色。

```html
<img src="http://localhost:3000/seed/demo/800/600" />
```

### 响应头

- `Cache-Control: public, max-age=31536000, immutable`
