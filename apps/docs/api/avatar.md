# 头像 API

按风格与标识生成头像。同一 `style` 与同一标识始终对应同一张图，可直接写入 `<img src>`。

- **`devimg`（图即头像）**：支持中文首字（如「张三」），可开关文字、形状与背景色
- **开源接入**：卡通、几何、像素等 50 余种风格（DiceBear、Jdenticon、Minidenticons）
- 默认 **SVG**；需要位图时使用 `.webp` / `.png` 后缀（单边上限 1024）

三方风格许可见 [头像许可](/guide/avatar-licenses)。使用规范见 [使用规范](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<AvatarPlayground />

<!-- markdownlint-enable MD033 -->

---

## `GET /avatar/:style/:seed/:size`

### 路径参数

| 参数 | 说明 |
| ------ | ------ |
| style | 风格 slug，见下方目录或 `GET /avatar/styles` |
| seed | 标识（姓名或用户名）；相同 style + seed 生成相同头像 |
| size | 边长，**16–4000**（SVG）；栅格化上限 **1024** |

路径可附加 `.webp` 或 `.png`。

### 示例

```html
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128" alt="张三" width="128" height="128" />
<img src="https://cdn.devimg.cn/avatar/lorelei/Luna/128" alt="Luna" width="128" height="128" />
<img src="https://cdn.devimg.cn/avatar/devimg/Luna/128?text=0" alt="pattern" width="128" height="128" />
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128?bg=3b5bdb&fg=ffffff" alt="brand" width="128" height="128" />
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128?shape=square" alt="square" width="128" height="128" />
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128.webp" alt="webp" width="128" height="128" />
```

### `devimg` Query

| 参数 | 说明 |
| ------ | ------ |
| text | `1` 显示首字（默认），`0` 不显示 |
| variant | `gradient` / `mesh` / `pattern` |
| shape | `circle`（默认）/ `square` |
| bg / fg | 背景色 / 字色，6 位 hex，不含 `#` |
| pattern | 纹理 id（`variant=pattern` 或风格 `devimg-pattern`） |
| format | `webp` / `png`；也可使用路径后缀 |

其他风格的可用 query 以 `GET /avatar/styles` 中该条目的 `queryParams` 为准。

### 响应头

- SVG：`Content-Type: image/svg+xml`
- `Cache-Control: public, max-age=31536000, immutable`
- 栅格输出限流 **60 次/分钟/IP**

---

## 风格目录

`GET /avatar/styles` 返回全部风格（含 `engine`、`license`、`provider`）。`GET /avatar/patterns` 返回图即纹理 id。

### 图即风格（节选）

| 名称 | style | 说明 |
| ------ | ------ | ------ |
| 图即头像 | `devimg` | 中文首字 / 渐变底，可配 `bg` `fg` |
| 几何弧环 | `devimg-geo` | 同心弧环 |
| 纹理头像 | `devimg-pattern` | CSS 纹理底 |
| 曼陀罗 | `devimg-mandala` | 算法 SVG |
| 玻璃拟态 | `devimg-glass` | 半透明叠层 |

`devimg-gradient`、`devimg-mesh`、`devimg-initials` 为 `devimg` 的别名。

### 开源接入（节选）

各风格独立许可，详见 [头像许可](/guide/avatar-licenses)。

| 名称 | style | 来源 |
| ------ | ------ | ------ |
| 圆环 | `rings` | DiceBear |
| 卡通人像 | `lorelei` | DiceBear |
| 经典矢量 | `avataaars` | DiceBear |
| 像素小人 | `pixel-art` | DiceBear |
| 拉丁缩写 | `initials` | DiceBear |
| 对称图标 | `jdenticon` | Jdenticon |
| 极简矩阵 | `minidenticon` | Minidenticons |

完整列表以 `GET /avatar/styles` 为准。

---

## 从 DiceBear 迁移

路径形式为 `/avatar/{style}/{seed}/{size}`。Query 参数与 DiceBear 官方 API **不完全相同**，请以本页与 `/avatar/styles` 为准。

码形占位（伪 QR / 条码）见 [码形占位 API](/api/qr)，与头像风格 `devimg-matrix` 用途不同：前者为独立码形占位并带 `X-DevImage-Pseudo-Code` 响应头。
