# 骨架屏 API

用于列表、卡片、详情页加载态的 SVG 骨架占位，100% 程序生成。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<SkeletonPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /skeleton/:width/:height`

返回 SVG 骨架屏。

### 参数

| 参数 | 位置 | 必填 | 说明 |
| ------ | ------ | ------ | ------ |
| width | path | 是 | 10–4000 |
| height | path | 是 | 10–4000 |
| type | query | 否 | `page`（默认）\| `card` \| `row` \| `grid` |
| theme | query | 否 | `light`（默认）\| `dark` |
| cols | query | 否 | `grid` 列数，1–6，默认 3 |
| animate | query | 否 | `0`（默认）\| `1` 启用 shimmer 动画 |

### 布局类型

| type | 说明 |
| ------ | ------ |
| page | 顶栏 + 多卡片条（移动端整页） |
| card | 左图右文卡片 |
| row | 列表行（圆头像 + 两行文字） |
| grid | 等分网格 cell |

### 示例

```html
<img src="http://localhost:3000/skeleton/375/812?type=page" />
<img src="http://localhost:3000/skeleton/350/120?type=card&theme=dark" />
<img src="http://localhost:3000/skeleton/300/64?type=row" />
<img src="http://localhost:3000/skeleton/800/600?type=grid&cols=3&animate=1" />
```

### 响应

- `Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=3600`
