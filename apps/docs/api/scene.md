# 场景图 API

## 在线试玩

<!-- markdownlint-disable MD033 -->

<ScenePlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /scene/:variant`

| variant | 说明 |
| --------- | ------ |
| `404` | 页面不存在 |
| `empty` | 空数据 |
| `network` | 网络错误 |
| `search` | 搜索无结果 |

### Query

| 参数 | 默认 | 说明 |
| ------ | ------ | ------ |
| w | 800 | 宽度 10–4000 |
| h | 600 | 高度 10–4000 |
| theme | `light` | `light` \| `dark` |
| title | variant 默认文案 | 覆盖标题 |
| subtitle | variant 默认文案 | 覆盖副标题 |
| accent | theme 默认色 | 品牌强调色 hex，不含 `#` |
| seed | — | 与占位/头像/伪码统一的 seed 调色板 |

### 示例

```html
<img src="http://localhost:3000/scene/404?w=800&h=600" />
<img src="http://localhost:3000/scene/empty" />
<img src="http://localhost:3000/scene/empty?theme=dark&title=购物车是空的&seed=demo" />
<img src="http://localhost:3000/scene/network?accent=6366f1&subtitle=稍后再试" />
```

> 当前仍为**文案 SVG**（无插画部件）；插画级 Scene Composer 见二期 B 规划。

## 快捷路由

```html
<img src="http://localhost:3000/404" />
<img src="http://localhost:3000/404?theme=dark&seed=demo" />
```
