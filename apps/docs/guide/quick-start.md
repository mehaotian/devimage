# 快速开始

图即（devimg）是面向国内开发者的占位资源 CDN。将 URL 写入 `<img>` 或 `fetch` 即可获取占位图、头像、真实照片、骨架屏、场景图与 Mock JSON，无需注册，也无需 API Key。

## 服务地址

| 服务 | 地址 |
| ------ | ------ |
| CDN | <https://cdn.devimg.cn> |

## 占位图

默认返回 SVG。需要固定画面时使用 `/seed`；需要与 placehold.co 相近的路径时可写 `/800x600`。

```html
<img src="https://cdn.devimg.cn/800/600" alt="placeholder" />
<img src="https://cdn.devimg.cn/400/300?text=Banner&bg=409eff&fg=ffffff" alt="banner" />
<img src="https://cdn.devimg.cn/seed/my-app/800/600" alt="seed placeholder" />
<img src="https://cdn.devimg.cn/800x600?text=Banner" alt="placehold alias" />
```

详见 [占位图 API](/api/placeholder)。

## 头像

同一风格与同一标识始终返回同一张图。`devimg` 支持中文首字。

```html
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128" alt="张三" />
<img src="https://cdn.devimg.cn/avatar/devimg/Luna/128?text=0" alt="gradient" />
<img src="https://cdn.devimg.cn/avatar/lorelei/Luna/128" alt="lorelei" />
```

风格列表见 [头像 API](/api/avatar)，三方风格许可见 [头像许可](/guide/avatar-licenses)。

## 真实照片

按用途（`scene`）或题材（`cat`）取图。带 `seed` 时同一 URL 固定同一张；省略 `seed` 时每次请求可能不同。

```html
<img src="https://cdn.devimg.cn/photo/400/400?scene=product&seed=product-5" alt="product" />
<img src="https://cdn.devimg.cn/photo/320/200?scene=news" alt="news" />
```

详见 [真实照片 API](/api/photo)。从 picsum 迁移见 [迁移指南](/migrate/from-picsum)。

## 骨架屏与场景图

骨架屏用于列表、卡片等加载态。场景图为文案 SVG，覆盖 404、空数据、网络错误与搜索无结果。

```html
<img src="https://cdn.devimg.cn/skeleton/350/120?type=card" alt="skeleton" />
<img src="https://cdn.devimg.cn/scene/empty?w=800&h=600" alt="empty" />
<img src="https://cdn.devimg.cn/404" alt="404" />
```

## 码形占位

生成的图案**不是**有效二维码或条形码，不可扫描，仅用于界面占位。

```html
<img src="https://cdn.devimg.cn/qr/demo/128" alt="pseudo qr" width="128" height="128" />
<img src="https://cdn.devimg.cn/barcode/sku-mock/320/80" alt="pseudo barcode" width="320" height="80" />
```

详见 [码形占位 API](/api/qr)。

## Mock 数据

路径习惯接近 [JSONPlaceholder](https://jsonplaceholder.typicode.com)，前缀为 `/mock`。每类资源池 100 条，同一 `id` 内容固定。

```javascript
const users = await fetch('https://cdn.devimg.cn/mock/users').then((r) => r.json());
const post = await fetch('https://cdn.devimg.cn/mock/posts/1').then((r) => r.json());
```

详见 [Mock 数据 API](/api/mock)。请遵守 [使用规范](/guide/fair-use)，避免对 Mock 接口高频轮询。

## 下一步

- [功能一览](/guide/dev-spec)：已上线路由与后期规划
- [占位图 API](/api/placeholder)
- [从 picsum 迁移](/migrate/from-picsum)
- [从 placehold 迁移](/migrate/from-placehold)
