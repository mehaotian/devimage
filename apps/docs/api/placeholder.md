# 占位图 API

## `GET /:width/:height`

返回 SVG 占位图。

### 参数

| 参数 | 位置 | 必填 | 说明 |
|------|------|------|------|
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

---

## 在线预览

<iframe src="http://localhost:3000/400/200?text=DevImage" width="420" height="220" style="border:1px solid #e2e8f0;border-radius:8px;"></iframe>

> 本地开发时需先运行 `pnpm dev:api`
