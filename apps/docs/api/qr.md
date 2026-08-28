# 码形占位 API

本组接口生成**外观类似**二维码或条形码的 SVG / 位图，用于结账页、物流单、卡片等 UI 占位。

生成结果**不是**有效编码，**不能扫描**，请勿用于支付、登录、核销或物流追踪。响应头 `X-DevImage-Pseudo-Code` 标明类型。

使用规范见 [使用规范](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<CodePlayground />

<!-- markdownlint-enable MD033 -->

---

## 伪 QR · `GET /qr/:seed/:size`

正方形码形。

| 参数 | 约束 | 说明 |
| ------ | ------ | ------ |
| `seed` | 非空，≤ 50 字符 | 标识，如 `demo`、`checkout` |
| `size` | 10–4000 | 边长（px） |

### 矩形 · `GET /qr/:seed/:w/:h`

非正方形时，矩阵居中并留边，适合横幅或卡片内嵌。

```html
<img src="https://cdn.devimg.cn/qr/demo/320/80" alt="banner qr mock" width="320" height="80" />
```

### 伪 QR Query

| 参数 | 说明 |
| ------ | ------ |
| `fg` | 模块深色 hex（不含 `#`） |
| `bg` | 背景浅色 hex |
| `accent` | 少量强调模块 hex |
| `variant` | `matrix`（默认，含定位符）\| `minimal` \| `dots` |
| `radius` | 模块圆角 0–50（占模块边长百分比；`dots` 忽略） |

```html
<img src="https://cdn.devimg.cn/qr/demo/128" alt="pseudo qr" width="128" height="128" />
<img src="https://cdn.devimg.cn/qr/checkout/256?fg=111111&bg=f5f5f5&variant=dots" alt="dots" />
<img src="https://cdn.devimg.cn/qr/demo/128.webp" width="128" height="128" alt="webp" />
```

响应头：`X-DevImage-Pseudo-Code: qr`

---

## 伪条码 · `GET /barcode/:seed/:w/:h`

| 参数 | 约束 | 说明 |
| ------ | ------ | ------ |
| `seed` | 非空，≤ 50 字符 | 如 `sku-mock` |
| `w` | 10–4000 | 宽度（px） |
| `h` | 10–4000 | 高度（px） |

### 伪条码 Query

| 参数 | 说明 |
| ------ | ------ |
| `fg` | 条纹 hex |
| `bg` | 背景 hex |
| `variant` | `code128`（默认）或 `ean13`（外形接近 EAN-13，仍不可扫） |

```html
<img src="https://cdn.devimg.cn/barcode/sku-mock/320/80" alt="pseudo barcode" width="320" height="80" />
<img src="https://cdn.devimg.cn/barcode/demo/320/80?variant=ean13&fg=1a1a1a&bg=fafafa" alt="ean13 mock" />
```

响应头：`X-DevImage-Pseudo-Code: barcode`

---

## `GET /code/styles`

返回伪 QR / 伪条码可用的 `variant` 与 query 说明（JSON）。

```bash
curl https://cdn.devimg.cn/code/styles
```

---

## 栅格与缓存

默认 SVG。路径后缀 `.webp` / `.png`；栅格单边上限 **1024**，限流 **60 次/分钟/IP**。

| Header | 伪 QR | 伪条码 |
| ------ | ------ | ------ |
| `Cache-Control` | `public, max-age=31536000, immutable` | 同左 |
| `X-DevImage-Pseudo-Code` | `qr` | `barcode` |

---

## 与头像 `devimg-matrix` 的区别

| 项 | `/qr/:seed/:size` | `/avatar/devimg-matrix/:seed/:size` |
| ------ | ------------------- | ------------------------------------- |
| 用途 | 独立码形占位 | 头像风格之一 |
| 默认裁剪 | 方形 | 圆形 |
| 响应头 | `X-DevImage-Pseudo-Code: qr` | 头像通用头 |
