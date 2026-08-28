# 场景图 API

返回 404、空数据、网络错误、搜索无结果等状态的 SVG。可改尺寸、明暗主题、标题与强调色。当前为文案与配色，不含插画。后续方向见 [功能一览 · 后期规划](/guide/dev-spec#后期规划)。

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
| title | 该 variant 默认文案 | 覆盖标题 |
| subtitle | 该 variant 默认文案 | 覆盖副标题 |
| accent | 主题默认色 | 强调色 hex，不含 `#` |
| seed | — | 固定调色板 |

### 示例

```html
<img src="https://cdn.devimg.cn/scene/404?w=800&h=600" alt="404" />
<img src="https://cdn.devimg.cn/scene/empty" alt="empty" />
<img src="https://cdn.devimg.cn/scene/empty?theme=dark&title=购物车是空的&seed=demo" alt="empty cart" />
<img src="https://cdn.devimg.cn/scene/network?accent=3b5bdb&subtitle=稍后再试" alt="network" />
```

### 响应

- `Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=86400`

## 快捷路由

`GET /404` 与 `GET /scene/404` 相同，并支持同一组 query。

```html
<img src="https://cdn.devimg.cn/404" alt="404" />
<img src="https://cdn.devimg.cn/404?theme=dark&seed=demo" alt="404 dark" />
```
