# 头像 API

DevImage 头像统一走 **`GET /avatar/:style/:seed/:size`**，含**自研 native** 与**三方 partner** 接入（DiceBear、Jdenticon、Minidenticons）。

| 类型 | 路由 | engine |
| ------ | ------ | ------ |
| 多风格 seed | `GET /avatar/:style/:seed/:size` | `native` / `partner` |
| 风格列表 | `GET /avatar/styles` | — |

中文首字请用自研 **`devimg`**（默认显示首字，支持 `variant` / `text` / `bg` / `fg`）。使用规范见 [公平使用](/guide/fair-use)；许可见 [头像许可](/guide/avatar-licenses)。

## 风格试玩

<!-- markdownlint-disable MD033 -->

<AvatarPlayground />

<!-- markdownlint-enable MD033 -->

---

## 风格目录

当前共 **44** 种风格：**5** 自研（含 3 个别名）+ **39** 三方接入。完整 JSON 列表：`GET /avatar/styles`。

### 引擎与三方库

| 类型 | engine | provider | 风格数 | 库 / 站点 | npm |
| ------ | ------ | ------ | ------: | ------ | ------ |
| 自研 | `native` | `devimage` | 5 | DevImage 自研 SVG | — |
| 三方 | `partner` | `dicebear` | 37 | [DiceBear](https://www.dicebear.com/) | [@dicebear/core](https://www.npmjs.com/package/@dicebear/core) |
| 三方 | `partner` | `jdenticon` | 1 | [Jdenticon](https://jdenticon.com/) | [jdenticon](https://www.npmjs.com/package/jdenticon) |
| 三方 | `partner` | `minidenticons` | 1 | [Minidenticons](https://github.com/laem/minidenticons) | [minidenticons](https://www.npmjs.com/package/minidenticons) |

**分组（group）**：`gradient` 渐变 · `geometric` 几何 · `text` 文字 · `pixel` 像素 · `character` 角色 · `icon` 图标。

---

### 自研 native（devimage）

DevImage 自研算法生成，**无第三方署名要求**。渐变系统一为 **`devimg`**，通过 query 控制背景与首字；**`devimg-geo`** 为独立几何风格。

#### 主风格

| style | 名称 | 说明 | Query | 示例 |
| ------ | ------ | ------ | ------ | ------ |
| `devimg` | 图即头像 | 圆形头像：渐变/mesh 底 + 可选首字 | `variant`, `text`, `bg`, `fg` | `/avatar/devimg/张三/128` |
| `devimg-geo` | 几何弧环 | 同心弧环 stroke，抽象 identicon | — | `/avatar/devimg-geo/Luna/128` |

#### devimg Query 参数

| 参数 | 取值 | 默认 | 说明 |
| ------ | ------ | ------ | ------ |
| `variant` | `gradient` \| `mesh` | `gradient` | 背景：线性渐变 / 网格光斑 |
| `text` | `0` \| `1` | `1` | 是否显示首字 |
| `shape` | `circle` \| `square` | `circle` | 裁剪形状：圆形 / 方形 |
| `bg` | 6 位 hex | seed 推导 | 纯色底（覆盖 variant） |
| `fg` | 6 位 hex | `ffffff` | 首字颜色 |

```text
/avatar/devimg/张三/128
/avatar/devimg/Luna/128?text=0
/avatar/devimg/Luna/128?variant=mesh&text=0
/avatar/devimg/张三/128?shape=square
/avatar/devimg/张三/128?bg=6366f1&fg=ffffff
```

#### 兼容别名

| 别名 | 等价于 |
| ------ | ------ |
| `devimg-gradient` | `devimg?text=0&variant=gradient` |
| `devimg-mesh` | `devimg?text=0&variant=mesh` |
| `devimg-initials` | `devimg?text=1&variant=gradient` |

> **与 DiceBear `initials`**：`devimg` 支持中文首字；DiceBear 为拉丁缩写，见下方三方表。

---

### 三方接入 · DiceBear

通过 `@dicebear/core` + `@dicebear/styles` 本地渲染，**不请求** dicebear.com 外链。各 style 许可以 [DiceBear Licenses](https://www.dicebear.com/licenses/) 为准；需署名的 style 见 [头像许可](/guide/avatar-licenses#开源接入partner--dicebear)。

**URL 迁移**：DiceBear `https://api.dicebear.com/10.x/{style}/svg?seed={seed}` → DevImage `/avatar/{style}/{seed}/128`

#### 几何（geometric）

| style | 名称 | 说明 | 许可 | DiceBear | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `rings` | Rings | 同心彩色圆环 | CC0-1.0 | [rings](https://www.dicebear.com/styles/rings/) | `/avatar/rings/Luna/128` |
| `identicon` | Identicon | 经典 block identicon | CC0-1.0 | [identicon](https://www.dicebear.com/styles/identicon/) | `/avatar/identicon/Luna/128` |
| `shapes` | Shapes | 随机几何形状拼贴 | CC0-1.0 | [shapes](https://www.dicebear.com/styles/shapes/) | `/avatar/shapes/Luna/128` |
| `stripes` | Stripes | 斜向/横向条纹图案 | CC0-1.0 | [stripes](https://www.dicebear.com/styles/stripes/) | `/avatar/stripes/Luna/128` |
| `triangles` | Triangles | 三角块拼贴 | CC0-1.0 | [triangles](https://www.dicebear.com/styles/triangles/) | `/avatar/triangles/Luna/128` |
| `glass` | Glass | 玻璃拟态半透明色块 | CC0-1.0 | [glass](https://www.dicebear.com/styles/glass/) | `/avatar/glass/Luna/128` |
| `disco` | Disco | 放射状 disco 线条 | CC0-1.0 | [disco](https://www.dicebear.com/styles/disco/) | `/avatar/disco/Luna/128` |
| `shape-grid` | Shape Grid | 网格排列的几何块 | CC0-1.0 | [shape-grid](https://www.dicebear.com/styles/shape-grid/) | `/avatar/shape-grid/Luna/128` |
| `thumbs` | Thumbs | 点赞手势图标 | CC0-1.0 | [thumbs](https://www.dicebear.com/styles/thumbs/) | `/avatar/thumbs/Luna/128` |

#### 像素（pixel）

| style | 名称 | 说明 | 许可 | DiceBear | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `pixel-art` | Pixel Art | 彩色像素风小人 | CC0-1.0 | [pixel-art](https://www.dicebear.com/styles/pixel-art/) | `/avatar/pixel-art/Luna/128` |
| `pixel-art-neutral` | Pixel Art Neutral | 中性肤色像素小人 | CC0-1.0 | [pixel-art-neutral](https://www.dicebear.com/styles/pixel-art-neutral/) | `/avatar/pixel-art-neutral/Luna/128` |

#### 文字（text）

| style | 名称 | 说明 | 许可 | DiceBear | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `initials` | Initials | 拉丁字母缩写文字头像 | CC0-1.0 | [initials](https://www.dicebear.com/styles/initials/) | `/avatar/initials/AB/128` |
| `initial-face` | Initial Face | 字母 + 简笔表情组合 | CC0-1.0 | [initial-face](https://www.dicebear.com/styles/initial-face/) | `/avatar/initial-face/Luna/128` |

#### 图标（icon）

| style | 名称 | 说明 | 许可 | DiceBear | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `icons` | Bootstrap Icons | 从 Bootstrap Icons 随机取图标 | MIT | [icons](https://www.dicebear.com/styles/icons/) | `/avatar/icons/Luna/128` |
| `glyphs` | Glyphs | 简约 glyph 符号 | CC0-1.0 | [glyphs](https://www.dicebear.com/styles/glyphs/) | `/avatar/glyphs/Luna/128` |

#### 角色（character）

| style | 名称 | 说明 | 许可 | 作者 / 备注 | DiceBear | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `lorelei` | Lorelei | 彩色插画风人像 | CC0-1.0 | — | [lorelei](https://www.dicebear.com/styles/lorelei/) | `/avatar/lorelei/Luna/128` |
| `lorelei-neutral` | Lorelei Neutral | Lorelei 中性色版本 | CC0-1.0 | — | [lorelei-neutral](https://www.dicebear.com/styles/lorelei-neutral/) | `/avatar/lorelei-neutral/Luna/128` |
| `notionists` | Notionists | Notion 风简笔头像 | CC0-1.0 | — | [notionists](https://www.dicebear.com/styles/notionists/) | `/avatar/notionists/Luna/128` |
| `notionists-neutral` | Notionists Neutral | Notionists 中性色版本 | CC0-1.0 | — | [notionists-neutral](https://www.dicebear.com/styles/notionists-neutral/) | `/avatar/notionists-neutral/Luna/128` |
| `open-peeps` | Open Peeps | 手绘风 Open Peeps 人像 | CC0-1.0 | — | [open-peeps](https://www.dicebear.com/styles/open-peeps/) | `/avatar/open-peeps/Luna/128` |
| `croodles` | Croodles | 涂鸦风手绘头像 | CC0-1.0 | — | [croodles](https://www.dicebear.com/styles/croodles/) | `/avatar/croodles/Luna/128` |
| `croodles-neutral` | Croodles Neutral | Croodles 中性色版本 | CC0-1.0 | — | [croodles-neutral](https://www.dicebear.com/styles/croodles-neutral/) | `/avatar/croodles-neutral/Luna/128` |
| `fun-emoji` | Fun Emoji | 表情符号组合头像 | CC0-1.0 | — | [fun-emoji](https://www.dicebear.com/styles/fun-emoji/) | `/avatar/fun-emoji/Luna/128` |
| `miniavs` | Miniavs | 迷你简笔人像 | CC0-1.0 | — | [miniavs](https://www.dicebear.com/styles/miniavs/) | `/avatar/miniavs/Luna/128` |
| `toon-head` | Toon Head | 卡通大头风格 | CC0-1.0 | — | [toon-head](https://www.dicebear.com/styles/toon-head/) | `/avatar/toon-head/Luna/128` |
| `avataaars` | Avataaars | Pablo Stanley 经典矢量人像 | 免费商用 | Pablo Stanley | [avataaars](https://www.dicebear.com/styles/avataaars/) | `/avatar/avataaars/Luna/128` |
| `avataaars-neutral` | Avataaars Neutral | Avataaars 中性色版本 | 免费商用 | Pablo Stanley | [avataaars-neutral](https://www.dicebear.com/styles/avataaars-neutral/) | `/avatar/avataaars-neutral/Luna/128` |
| `bottts` | Bottts | 机器人头像 | 免费商用 | Pablo Stanley | [bottts](https://www.dicebear.com/styles/bottts/) | `/avatar/bottts/Luna/128` |
| `bottts-neutral` | Bottts Neutral | Bottts 中性色版本 | 免费商用 | Pablo Stanley | [bottts-neutral](https://www.dicebear.com/styles/bottts-neutral/) | `/avatar/bottts-neutral/Luna/128` |
| `adventurer` | Adventurer | 冒险者插画风 | CC BY 4.0 | Lisa Wischofsky | [adventurer](https://www.dicebear.com/styles/adventurer/) | `/avatar/adventurer/Luna/128` |
| `adventurer-neutral` | Adventurer Neutral | Adventurer 中性色版本 | CC BY 4.0 | Lisa Wischofsky | [adventurer-neutral](https://www.dicebear.com/styles/adventurer-neutral/) | `/avatar/adventurer-neutral/Luna/128` |
| `micah` | Micah | Micah 插画风人像 | CC BY 4.0 | Micah Lanier | [micah](https://www.dicebear.com/styles/micah/) | `/avatar/micah/Luna/128` |
| `personas` | Personas | Draftbit Personas 风格 | CC BY 4.0 | Draftbit | [personas](https://www.dicebear.com/styles/personas/) | `/avatar/personas/Luna/128` |
| `big-smile` | Big Smile | 大笑表情卡通头 | CC BY 4.0 | The Visual Team | [big-smile](https://www.dicebear.com/styles/big-smile/) | `/avatar/big-smile/Luna/128` |
| `big-ears` | Big Ears | 大耳朵卡通角色 | CC BY 4.0 | The Visual Team | [big-ears](https://www.dicebear.com/styles/big-ears/) | `/avatar/big-ears/Luna/128` |
| `big-ears-neutral` | Big Ears Neutral | Big Ears 中性色版本 | CC BY 4.0 | The Visual Team | [big-ears-neutral](https://www.dicebear.com/styles/big-ears-neutral/) | `/avatar/big-ears-neutral/Luna/128` |
| `dylan` | Dylan | Dylan 插画风头像 | CC BY 4.0 | Dylan S | [dylan](https://www.dicebear.com/styles/dylan/) | `/avatar/dylan/Luna/128` |

---

### 三方接入 · Jdenticon

独立 MIT 库，GitHub / Gravatar 常见的**对称几何 identicon**，与 DiceBear `identicon` 视觉不同。

| style | 名称 | 分组 | 说明 | 许可 | 站点 | npm | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `jdenticon` | Jdenticon | 几何 | 5×5 对称色块 + 可选「眼睛」形状 | MIT | [jdenticon.com](https://jdenticon.com/) | [jdenticon](https://www.npmjs.com/package/jdenticon) | `/avatar/jdenticon/Felix/128` |

---

### 三方接入 · Minidenticons

独立 MIT 库，**极简 5×5 像素** identicon，体积极小、风格现代。

| style | 名称 | 分组 | 说明 | 许可 | 仓库 | npm | 示例 |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| `minidenticon` | Minidenticon | 几何 | 纯色填充像素块，seed 决定图案与色相 | MIT | [laem/minidenticons](https://github.com/laem/minidenticons) | [minidenticons](https://www.npmjs.com/package/minidenticons) | `/avatar/minidenticon/Felix/128` |

---

## `GET /avatar/:style/:seed/:size`

根据 **style + seed** 生成确定性 SVG 头像。

### 头像渲染 Path 参数

| 参数 | 说明 |
| ------ | ------ |
| style | 风格 ID，见上方 [风格目录](#风格目录) 或 `GET /avatar/styles` |
| seed | 任意字符串；`devimg` 系列时 seed 常为用户名 |
| size | 10–4000 像素（正方形） |

### Query 参数（devimg 系列）

自研 **`devimg`** 及兼容别名支持以下 query（别名未传参时使用内置默认，见 [兼容别名](#兼容别名)）：

| 参数 | 格式 | 说明 | 示例 |
| ------ | ------ | ------ | ------ |
| variant | `gradient` \| `mesh` | 背景算法 | `mesh` |
| text | `0` \| `1` | 是否显示首字 | `0` |
| shape | `circle` \| `square` | 圆形 / 方形裁剪 | `square` |
| bg | 6 位 hex，不带 `#` | 纯色背景 | `6366f1` |
| fg | 6 位 hex，不带 `#` | 首字颜色 | `ffffff` |

规则：

- 非法 `variant` / `text` / `shape` / hex 返回 `400 Bad Request`
- 同一完整 URL 输出始终相同（`immutable` 缓存）

#### 配色对比示例

| 场景 | URL |
| ------ | ------ |
| 默认（gradient + 首字） | `/avatar/devimg/张三/128` |
| 纯渐变、无字 | `/avatar/devimg/Luna/128?text=0` |
| 品牌靛蓝底 + 白字 | `/avatar/devimg/张三/128?bg=6366f1&fg=ffffff` |
| mesh + 首字 | `/avatar/devimg/张三/128?variant=mesh` |
| 方形裁剪 | `/avatar/devimg/张三/128?shape=square` |

```html
<img src="http://localhost:3000/avatar/devimg/张三/128" alt="张三" width="128" height="128" />
<img src="http://localhost:3000/avatar/devimg/Luna/128?text=0" alt="Luna" width="128" height="128" />
<img src="http://localhost:3000/avatar/devimg/张三/128?bg=6366f1&fg=ffffff" alt="张三" width="128" height="128" />
```

```bash
curl "http://localhost:3000/avatar/devimg/张三/128?bg=6366f1&fg=ffffff" -o avatar.svg
```

### 其他风格示例

```html
<img src="http://localhost:3000/avatar/devimg-geo/Luna/128" />
<img src="http://localhost:3000/avatar/rings/Luna/128" />
<img src="http://localhost:3000/avatar/jdenticon/Felix/128" />
<img src="http://localhost:3000/avatar/minidenticon/Felix/128" />
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
| `styles[].provider` | `devimage` \| `dicebear` \| `jdenticon` \| `minidenticons` |
| `styles[].group` | `gradient` \| `geometric` \| `text` \| `pixel` \| `character` \| `icon` |
| `styles[].license` | 许可标识 |
| `styles[].aliasOf` | 可选；兼容别名指向 canonical style |
| `styles[].queryParams` | 可选；如 `["variant","text","bg","fg"]` |

---

## 响应头

| 路由 | Cache-Control |
| ------ | ------------- |
| `/avatar/:style/:seed/:size` | `public, max-age=31536000, immutable` |
| `/avatar/styles` | `public, max-age=3600` |

Content-Type：`image/svg+xml; charset=utf-8`
