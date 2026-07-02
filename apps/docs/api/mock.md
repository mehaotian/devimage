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
// 列表
GET /mock/users
GET /mock/users?count=20

// 单条
GET /mock/users/1
```

## 文章

```http
GET /mock/posts
GET /mock/posts?count=10
```

## 商品

```http
GET /mock/products
GET /mock/products?count=10
```

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
