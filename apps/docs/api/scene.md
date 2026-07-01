# 场景图 API

## `GET /scene/:variant`

| variant | 说明 |
|---------|------|
| `404` | 页面不存在 |
| `empty` | 空数据 |
| `network` | 网络错误 |
| `search` | 搜索无结果 |

### Query

| 参数 | 默认 |
|------|------|
| w | 800 |
| h | 600 |

```html
<img src="http://localhost:3000/scene/404?w=800&h=600" />
<img src="http://localhost:3000/scene/empty" />
```

## 快捷路由

```html
<img src="http://localhost:3000/404" />
```
