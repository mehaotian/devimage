# 码形占位 API（伪 QR · 伪条码）

> **重要**：本组路由生成的图案 **不是** 有效二维码或条形码，**不可扫描**，请勿用于支付、登录、物流扫码等真实业务。仅作 UI mock、骨架屏与文档示例占位。使用规范见 [公平使用](/guide/fair-use)。

## 在线试玩

<!-- markdownlint-disable MD033 -->

<CodePlayground />

<!-- markdownlint-enable MD033 -->

---

## 伪 QR · 正方形 `GET /qr/:seed/:size`

| 参数 | 约束 | 说明 |
| ------ | ------ | ------ |
| `seed` | 非空，≤ 50 字符 | 短标识，如 `demo`、`checkout` |
| `size` | 10–4000 | 正方形边长（px） |

### 伪 QR · 矩形 `GET /qr/:seed/:w/:h`

非正方形时矩阵 **居中留边**（`preserveAspectRatio=meet`），适合横幅、卡片内嵌方形码形。

```html
<img src="http://localhost:3000/qr/demo/320/80" alt="banner qr mock" width="320" height="80" />
```

### 伪 QR Query

| 参数 | 说明 |
| ------ | ------ |
| `fg` | 模块深色 hex（不含 `#`） |
| `bg` | 背景浅色 hex |
| `accent` | 少量强调模块 hex |
| `variant` | `matrix`（默认，含定位符）\| `minimal` \| `dots`（含定位符 + 圆点） |
| `radius` | 模块圆角 0–50（占模块边长 %，`dots` 变体忽略） |

```html
<img src="http://localhost:3000/qr/demo/128" alt="伪 QR 占位" width="128" height="128" />
<img src="http://localhost:3000/qr/checkout/256?fg=111111&bg=f5f5f5&variant=dots" />
<img src="http://localhost:3000/qr/demo/128.webp" width="128" height="128" />
<img src="http://localhost:3000/qr/demo/320/80.png" width="320" height="80" />
```

响应头 `X-DevImage-Pseudo-Code: qr`

---

## 伪条码 · `GET /barcode/:seed/:w/:h`

| 参数 | 约束 | 说明 |
| ------ | ------ | ------ |
| `seed` | 非空，≤ 50 字符 | 如 `sku-mock`、`logistics` |
| `w` | 10–4000 | 宽度（px），常见 320 |
| `h` | 10–4000 | 高度（px），常见 80 |

### 伪条码 Query

| 参数 | 说明 |
| ------ | ------ |
| `fg` | 条纹 hex |
| `bg` | 背景 hex |
| `variant` | `code128`（默认）或 `ean13`（外形 guard，仍不可扫） |

```html
<img src="http://localhost:3000/barcode/sku-mock/320/80" alt="伪条码" width="320" height="80" />
<img src="http://localhost:3000/barcode/demo/320/80?variant=ean13&fg=1a1a1a&bg=fafafa" />
<img src="http://localhost:3000/barcode/sku-mock/320/80.webp" width="320" height="80" />
```

响应头 `X-DevImage-Pseudo-Code: barcode`

---

## 风格目录 · `GET /code/styles`

返回伪 QR / 伪条码可用 `variant` 与 query 参数说明（JSON）。文档站 Playground 启动时会拉取此接口同步 variant 下拉列表。

```bash
curl http://localhost:3000/code/styles
```

---

## 栅格输出

SVG 为默认。WebP / PNG 路径后缀；栅格单边尺寸上限 **1024**（与头像一致）。

---

## 响应头

| Header | 伪 QR | 伪条码 |
| ------ | ------ | ------ |
| `Cache-Control` | `public, max-age=31536000, immutable` | 同左 |
| `X-DevImage-Pseudo-Code` | `qr` | `barcode` |

---

## 与头像 `devimg-matrix` 的区别

| 项 | `/qr/:seed/:size` | `/avatar/devimg-matrix/:seed/:size` |
| ------ | ------------------- | ------------------------------------- |
| 用途 | 独立方形码形占位 | 头像风格试玩 |
| 裁剪 | 方形 | 默认圆形 |
| 响应头 | `X-DevImage-Pseudo-Code: qr` | 头像通用头 |
