# Mock 数据 API

兼容 [JSONPlaceholder](https://jsonplaceholder.typicode.com) 使用习惯，路径前缀为 `/mock`。

Mock 请勿高频轮询，详见 [公平使用](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<MockPlayground />

<!-- markdownlint-enable MD033 -->

---

## 用户

```javascript
// 列表（count 或分页二选一）
GET /mock/users
GET /mock/users?count=20
GET /mock/users?_page=1&_limit=10

// 单条（id 1–100）
GET /mock/users/1
```

## 文章

```http
GET /mock/posts
GET /mock/posts?count=10
GET /mock/posts?_page=2&_limit=5
GET /mock/posts/1
```

## 商品

```http
GET /mock/products
GET /mock/products?count=10
GET /mock/products?_page=1&_limit=10
GET /mock/products/3
```

### 分页说明

| 参数 | 说明 |
| ------ | ------ |
| `_page` | 页码，从 1 开始 |
| `_limit` | 每页条数，最大 100 |
| `count` | 与分页互斥；未传 `_page`/`_limit` 时生效，默认 10 |

资源池固定 **100** 条（id 1–100），同一 id 每次返回相同内容。

### 响应示例

```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "avatar": "https://cdn.devimage.cn/avatar/.../128",
  "phone": "13800138000",
  "address": "上海"
}
```

### 缓存

`Cache-Control: public, max-age=300`
