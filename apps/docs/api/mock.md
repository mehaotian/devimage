# Mock 数据 API

提供中文假数据 JSON，路径习惯接近 [JSONPlaceholder](https://jsonplaceholder.typicode.com)，前缀为 `/mock`。用于列表、详情与分页联调，不是持久化后端。

每类资源池固定 **100** 条（id 1–100）。同一 id 每次返回相同字段。请勿高频轮询，见 [使用规范](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<MockPlayground />

<!-- markdownlint-enable MD033 -->

---

## 用户

```http
GET /mock/users
GET /mock/users?count=20
GET /mock/users?_page=1&_limit=10
GET /mock/users/1
```

字段包括 `id`、`name`、`email`、`avatar`、`phone`、`address`。`avatar` 指向本服务的头像 URL。

## 文章

```http
GET /mock/posts
GET /mock/posts?count=10
GET /mock/posts?_page=2&_limit=5
GET /mock/posts/1
```

字段包括 `id`、`userId`、`title`、`body`、`cover`。`cover` 在图库可用时为照片 URL，否则为合成占位图。

## 商品

```http
GET /mock/products
GET /mock/products?count=10
GET /mock/products?_page=1&_limit=10
GET /mock/products/3
```

字段包括 `id`、`name`、`price`、`image`。`image` 规则与文章 `cover` 相同。

### 分页

| 参数 | 说明 |
| ------ | ------ |
| `_page` | 页码，从 1 开始 |
| `_limit` | 每页条数，最大 100 |
| `count` | 与分页互斥；未传 `_page` / `_limit` 时生效，默认 10，最大 100 |

`count` 与 `_page`/`_limit` 不要同时使用。

### 响应示例

```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "avatar": "https://cdn.devimg.cn/avatar/devimg/张三/128",
  "phone": "13800138000",
  "address": "上海"
}
```

字段值为示例结构；实际姓名、邮箱等由固定种子生成，与 id 对应。

### 缓存

`Cache-Control: public, max-age=300`

写操作（`POST` / `PUT` / `DELETE`）与嵌套资源尚未提供，见 [功能一览 · 后期规划](/guide/dev-spec#后期规划)。
