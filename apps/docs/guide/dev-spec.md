# 功能一览

图即当前已开放的接口如下。尺寸范围均为 **10–4000**（栅格输出单边上限 **1024**）。接口路径不含版本号前缀。

完整参数与示例见各 API 页。

---

## 已上线路由

### 占位图

合成色块或纹理 SVG，可选 WebP / PNG。兼容 placehold 的 `宽x高` 与路径配色。

| 路由 | 说明 |
| ------ | ------ |
| `GET /:width/:height` | 色块占位；无 `bg` 时背景色随机 |
| `GET /seed/:seed/:width/:height` | 相同 seed 固定配色 |
| `GET /800x600` | placehold 别名（`宽x高`） |
| `GET /:w/:h/:bg/:fg` | 路径配色，如 `/800/600/eee/fff` |

Query：`text`、`bg`/`bc`、`fg`/`tc`、`format`、`border`、`borderColor`、`cross`、`style=pattern`、`pattern`。

文档：[占位图 API](/api/placeholder)

### 骨架屏

| 路由 | 说明 |
| ------ | ------ |
| `GET /skeleton/:width/:height` | SVG 骨架屏 |

Query：`type`（`page` / `card` / `row` / `grid`）、`theme`、`cols`、`animate`。

文档：[骨架屏 API](/api/skeleton)

### 头像

同一 `style` + 标识始终同一张图。图即风格支持中文首字；另接入 DiceBear、Jdenticon、Minidenticons，合计 **50 余种**风格（含少量别名）。

| 路由 | 说明 |
| ------ | ------ |
| `GET /avatar/:style/:seed/:size` | 头像 SVG；可加 `.webp` / `.png` |
| `GET /avatar/styles` | 风格目录 JSON（含 engine、license） |
| `GET /avatar/patterns` | 图即纹理 id 列表 |

文档：[头像 API](/api/avatar) · [头像许可](/guide/avatar-licenses)

### 码形占位

图案仅作界面占位，**不可扫描**。

| 路由 | 说明 |
| ------ | ------ |
| `GET /qr/:seed/:size` | 伪 QR（正方形） |
| `GET /qr/:seed/:w/:h` | 伪 QR（矩形，码形居中留边） |
| `GET /barcode/:seed/:w/:h` | 伪条码 |
| `GET /code/styles` | variant 与参数说明 JSON |

文档：[码形占位 API](/api/qr)

### 场景图

当前为**文案 SVG**（可改标题、副标题、主题色），不是插画。快捷路由 `/404` 等价于 `/scene/404`。

| 路由 | variant |
| ------ | --------- |
| `GET /scene/:variant` | `404`、`empty`、`network`、`search` |
| `GET /404` | 同上，固定 404 |

Query：`w`、`h`、`theme`、`title`、`subtitle`、`accent`、`seed`。

文档：[场景图 API](/api/scene)

### 真实照片

按用途或题材取图。带 `seed` 时固定；省略则随机。亦提供 picsum 风格的 id / 列表接口。

| 路由 | 说明 |
| ------ | ------ |
| `GET /photo/:width/:height` | 按 `scene` 或 `cat` 取图 |
| `GET /photo/categories` | 题材列表 |
| `GET /photo/scenes` | 用途列表 |
| `GET /id/:id/:width/:height` | 按图库 id（picsum 兼容） |
| `GET /id/:id/info` | 照片元信息 |
| `GET /v2/list` | 照片列表 |

Query：`scene`、`cat`、`seed`、`grayscale`、`blur`、`format`（`webp` 默认、`jpeg`、`png`）。

文档：[真实照片 API](/api/photo)

### Mock 数据

中文假数据，习惯接近 JSONPlaceholder。每类资源池 **100** 条（id 1–100），同一 id 内容固定。

| 路由 | 说明 |
| ------ | ------ |
| `GET /mock/users` | 用户列表 |
| `GET /mock/users/:id` | 单个用户 |
| `GET /mock/posts` | 文章列表（含封面图） |
| `GET /mock/posts/:id` | 单篇文章 |
| `GET /mock/products` | 商品列表（含商品图） |
| `GET /mock/products/:id` | 单个商品 |

列表支持 `count`，或 `_page` + `_limit` 分页（二者勿混用）。

文档：[Mock 数据 API](/api/mock)

---

## 后期规划

以下内容**尚未开放**，列入规划是为说明产品方向，不作为当前接口承诺。上线后会更新本页与对应 API 文档。

| 方向 | 说明 |
| ------ | ------ |
| 场景插画 | 在现有文案 SVG 之上提供插画级空状态 / 404 等画面 |
| 用量与密钥 | 按调用量或 API Key 分层；限额变更会提前在文档公布 |
| Mock 写操作 | 模拟 `POST` / `PUT` / `DELETE` 成功响应（仍为假数据） |
| 嵌套 Mock | 如评论等从属资源，便于列表-详情联调 |
| 更多资源类型 | 图标、Lottie、音效等开发素材 CDN |
| 团队与私有化 | 私有资源库、私有化部署 |

当前不提供自定义图库上传、真实可扫码生成，以及 Mock 数据的持久化写入。
