# 头像 API

DevImage 头像统一走 **`GET /avatar/:style/:seed/:size`**，含自研 native 与开源 partner（DiceBear）。

| 类型 | 路由 | engine |
| ------ | ------ | ------ |
| 多风格 seed | `GET /avatar/:style/:seed/:size` | `native` / `partner` |
| 风格列表 | `GET /avatar/styles` | — |

中文首字请用 **`devimg-initials`**。使用规范见 [公平使用](/guide/fair-use)；许可见 [头像许可](/guide/avatar-licenses)。

## 风格试玩

<!-- markdownlint-disable MD033 -->

<AvatarPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /avatar/:style/:seed/:size`

根据 **style + seed** 生成确定性 SVG 头像。

### Path 参数

| 参数 | 说明 |
| ------ | ------ |
| style | 风格 ID，见 `GET /avatar/styles` |
| seed | 任意字符串；`devimg-initials` 时 seed 为用户名 |
| size | 10–4000 像素（正方形） |

### Query（部分 native 风格）

| 参数 | 说明 |
| ------ | ------ |
| bg | 背景色 hex（`devimg-initials`） |
| fg | 文字色 hex（`devimg-initials`） |

### 示例

```html
<img src="http://localhost:3000/avatar/devimg-gradient/Luna/128" />
<img src="http://localhost:3000/avatar/devimg-initials/张三/128" />
<img src="http://localhost:3000/avatar/rings/Luna/128" />
```

---

## `GET /avatar/styles`

```bash
curl http://localhost:3000/avatar/styles
```

| 字段 | 说明 |
| ------ | ------ |
| `count` | 风格总数 |
| `nativeCount` | 自研风格数 |
| `partnerCount` | 第三方接入数 |
| `styles[].engine` | `native` \| `partner` |
| `styles[].provider` | `devimage` \| `dicebear` |
| `styles[].license` | 许可标识 |

### 自研 native（节选）

| style | 名称 |
| ------ | ------ |
| devimg-gradient | 渐变圆 |
| devimg-mesh | 网格渐变 |
| devimg-geo | 几何弧环 |
| devimg-initials | 渐变首字 |

### partner 迁移（DiceBear）

| DiceBear | DevImage |
| -------- | ---------- |
| `10.x/rings/svg?seed=Luna` | `/avatar/rings/Luna/128` |

---

## 响应头

| 路由 | Cache-Control |
| ------ | ------------- |
| `/avatar/:style/:seed/:size` | `public, max-age=31536000, immutable` |
| `/avatar/styles` | `public, max-age=3600` |

Content-Type：`image/svg+xml; charset=utf-8`
