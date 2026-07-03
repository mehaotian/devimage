# 快速开始

DevImage 提供 **URL 即 API** 的占位资源服务，无需注册、无需 API Key（MVP 阶段）。

## 安装与启动

> **必须使用 pnpm**，在仓库**根目录**执行安装。
> 依赖位于 `apps/api` 与 `apps/docs`，根目录 `pnpm install` 会一并安装。

```bash
# 安装 pnpm
corepack enable && corepack prepare pnpm@9.15.0 --activate

# 安装全部 workspace 依赖
pnpm install

# 启动 API + 文档站
pnpm dev
```

| 服务 | 地址 |
| ------ | ------ |
| API | <http://localhost:3000> |
| Swagger | <http://localhost:3000/api/docs> |
| 文档站 | <http://localhost:5173> |

## 占位图

```html
<!-- 随机色块 -->
<img src="http://localhost:3000/800/600" />

<!-- 自定义文字与颜色 -->
<img src="http://localhost:3000/400/300?text=Banner&bg=409eff&fg=ffffff" />

<!-- 固定 seed（每次相同） -->
<img src="http://localhost:3000/seed/my-app/800/600" />
```

## 头像

```html
<!-- 首字头像（devimg 默认 text=1） -->
<img src="http://localhost:3000/avatar/devimg/张三/128" alt="avatar" />

<!-- 纯渐变、无首字 -->
<img src="http://localhost:3000/avatar/devimg/Luna/128?text=0" alt="gradient avatar" />

<!-- 图即算法风格（玻璃拟态） -->
<img src="http://localhost:3000/avatar/devimg-glass/Luna/128" alt="glass avatar" />

<!-- 多风格 seed（DiceBear rings） -->
<img src="http://localhost:3000/avatar/rings/Luna/128" alt="rings avatar" />
```

风格列表与在线试玩见 [头像 API](/api/avatar)。

## 码形占位（伪 QR · 伪条码）

```html
<img src="http://localhost:3000/qr/demo/128" alt="pseudo qr" width="128" height="128" />
<img src="http://localhost:3000/qr/demo/320/80?variant=dots" alt="banner qr" width="320" height="80" />
<img src="http://localhost:3000/barcode/sku-mock/320/80" alt="pseudo barcode" width="320" height="80" />
```

详见 [码形占位 API](/api/qr)。

## Mock 数据

```javascript
fetch('http://localhost:3000/mock/users')
  .then((r) => r.json())
  .then(console.log);
```

## 场景图

```html
<img src="http://localhost:3000/scene/404?w=800&h=600" />
<img src="http://localhost:3000/scene/empty" />
```

## 环境变量

| 变量 | 默认 | 说明 |
| ------ | ------ | ------ |
| `PORT` | `3000` | API 端口 |
| `VITE_API_BASE` | `http://localhost:3000` | 文档站示例 URL 前缀 |

## 下一步

- [占位图 API](/api/placeholder)
- [从 picsum 迁移](/migrate/from-picsum)
- [腾讯云部署指南](/guide/deployment)
