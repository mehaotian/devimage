# 头像占位

写进 `<img src="…">` 即可用的**多风格头像**：同一名字 + 同一风格 → 始终同一张图。

- 推荐 **`devimg` 图即头像**：支持**中文首字**（如「张三」）
- 另有卡通、几何、像素等 50+ 风格，试玩区 **浏览** 可预览全部
- 默认 **SVG**；小程序等场景可换 **WebP / PNG**

使用规范见 [公平使用](/guide/fair-use)；三方风格许可见 [头像许可](/guide/avatar-licenses)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<AvatarPlayground />

<!-- markdownlint-enable MD033 -->

---

## 示例

### 中文首字（推荐）

```html
<img
  src="http://localhost:3000/avatar/devimg/张三/128"
  alt="张三"
  width="128"
  height="128"
/>
```

### 英文用户名 · 卡通风格

```html
<img
  src="http://localhost:3000/avatar/lorelei/Luna/128"
  alt="Luna"
  width="128"
  height="128"
/>
```

### 纯图案、不显示文字

```html
<img
  src="http://localhost:3000/avatar/devimg/Luna/128?text=0"
  alt="Luna"
  width="128"
  height="128"
/>
```

### 品牌色底

```html
<img
  src="http://localhost:3000/avatar/devimg/张三/128?bg=6366f1&fg=ffffff"
  alt="张三"
  width="128"
  height="128"
/>
```

### 方形头像

```html
<img
  src="http://localhost:3000/avatar/devimg/张三/128?shape=square"
  alt="张三"
  width="128"
  height="128"
/>
```

### 小程序 / 位图

```html
<img
  src="http://localhost:3000/avatar/devimg/张三/128.webp"
  width="128"
  height="128"
/>
<img
  src="http://localhost:3000/avatar/devimg/张三/128.png"
  width="128"
  height="128"
/>
```

---

## 推荐风格

试玩里「风格」下拉按 **图即原创** 与 **开源接入** 分组（URL 路径中的 `style`）：

### 图即原创

| 名称 | style | 说明 |
| ------ | ------ | ------ |
| 图即头像 | `devimg` | 中文首字 / 渐变底，可配 `bg` `fg` |
| 几何弧环 | `devimg-geo` | 同心弧环 |
| 纹理头像 | `devimg-pattern` | 43 种 CSS 纹理底 |
| 曼陀罗 | `devimg-mandala` | 算法 SVG |

### 开源接入

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

更多风格请在试玩 **浏览** 中点击缩略图选用。

---

## 参数参考

`GET /avatar/:style/:标识/:size`

| 部分 | 说明 |
| ------ | ------ |
| style | 风格 slug（见上表或试玩浏览） |
| 标识 | 名字 / 用户名；同风格下相同标识 → 相同头像 |
| size | 边长像素，**16–4000**（SVG）；栅格化上限 **1024** |

### devimg 可选参数（query）

| 参数 | 说明 |
| ------ | ------ |
| text | `1` 显示首字（默认），`0` 不显示 |
| variant | `gradient` / `mesh` / `pattern` 背景类型 |
| shape | `circle`（默认）/ `square` |
| bg / fg | 背景色 / 字色，6 位 hex，不含 `#` |
| pattern | 纹理 id（`variant=pattern` 或 `devimg-pattern`） |
| format | `webp` / `png`；或路径后缀 `.webp` `.png` |

---

## 其他

- 从 DiceBear 外链迁移：路径 `/avatar/{style}/{seed}/{size}`，query 与官方 API 不同，见试玩区复制链接
- 码形占位（伪 QR / 条码）：[码形占位 API](/api/qr)
- 头像模块风格集已稳定，暂不再新增
