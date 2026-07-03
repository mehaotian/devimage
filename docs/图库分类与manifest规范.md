# 图库分类与 manifest 规范

> **用途**：DevImage 真实图库（Pexels CC0）上传 COS 前的**分类标准、缺口清单、manifest 字段约定**。  
> **状态**：规范文档 · 暂不进入 API 开发  
> **相关**：[占位与场景差异化规划](./占位与场景差异化规划.md) · [腾讯云 COS 部署指南](./腾讯云COS部署指南.md)

---

## 1. 设计原则

### 1.1 双层 taxonomy

图库采用 **视觉分类（cat）** + **业务场景（scene）** 两层，职责分离：

| 层级 | 字段 | 谁维护 | 用途 |
| ------ | ------ | ------ | ------ |
| **cat** | 中文目录名，如 `美食` | 图库采集脚本 / 人工目录 | Pexels 检索、COS 原图路径、按题材浏览 |
| **scene** | 英文 slug，如 `product` | manifest 标注 | Mock 映射、选图、场景化 |

**原则**：

- **cat 按「拍的是什么」分**，不按 UI 槽位分（如不做「列表缩略图」类）。
- **scene 按「页面用在哪」分**，一个 scene 可映射多个 cat（见 §5）。
- Mock JSON 只暴露 **scene**，不强迫开发者记 73 个中文 cat。
- 同一 `id`（1–100）在同一 scene 内**确定性**返回同一张图（与 Mock 池对齐）。

### 1.2 数量与质量

| 项 | 标准 |
| ------ | ------ |
| 每 cat 目标张数 | **100 张**（允许 95–105，采集脚本容差） |
| 单张最小边长 | **≥ 1200px**（原图；API 侧 Sharp 裁剪） |
| 格式 | 原图 JPEG；CDN 缓存 WebP |
| 版权 | 仅 Pexels；每张保留 `pexels_id` + `photographer` |
| 禁止 | 同步请求 Pexels API（仅离线批量采集） |

### 1.3 cat 命名规范

| 规则 | 示例 |
| ------ | ------ |
| 中文，2–6 字 | `数码产品` ✅ · `product` ❌ |
| 不用 `/`、空格、英文 slug 作目录名 | `电商主图` ✅ |
| 同类不重复建近义 cat | `咖啡` / `咖啡馆` 保留但 manifest 设 **alias 组**（§4.3） |
| 新增 cat 须登记本文 §3 缺口表 | 避免与现有 73 类撞名 |

---

## 2. 现有图库盘点（73 cat · ~7300 张）

> 路径：`placeholder-images/{cat}/pexels_{id}.jpeg` + `pexels_{id}_meta.json`  
> 统计时间：2026-07-03

### 2.1 按用途分组

#### A. 电商 / 商品（Mock `product` 主力）

| cat | 张数 | scene 默认 | 备注 |
| ------ | ------ | ------ | ------ |
| 数码产品 | 100 | product | alias 组 `digital` |
| 电子产品 | 100 | product | alias 组 `digital` |
| 手机 | 100 | product | alias 组 `digital` |
| 电脑 | 100 | product | alias 组 `digital` |
| 耳机 | 100 | product | alias 组 `digital` |
| 键盘 | 100 | product | alias 组 `digital` |
| 鼠标 | 100 | product | alias 组 `digital` |
| 服装 | 100 | product | |
| 鞋子 | 100 | product | |
| 包包 | 100 | product | |
| 家电 | 100 | product | |
| 玩具 | 100 | product | |
| 礼物 | 100 | product | |
| 水果 | 100 | food | 亦可用于 product |

#### B. 餐饮 / 本地生活（Mock `food`）

| cat | 张数 | scene 默认 | 备注 |
| ------ | ------ | ------ | ------ |
| 美食 | 101 | food | |
| 甜品 | 100 | food | |
| 饮料 | 100 | food | |
| 咖啡 | 100 | food | alias 组 `cafe` |
| 咖啡馆 | 100 | food | alias 组 `cafe` |

#### C. 内容与社交（Mock `news` / `article` / `social`）

| cat | 张数 | scene 默认 | 备注 |
| ------ | ------ | ------ | ------ |
| 人物 | 100 | social | 偏肖像；新闻场景需 **§3 补「新闻」** |
| 书籍 | 102 | article | |
| 办公 | 100 | article | alias 组 `office` |
| 办公桌 | 100 | article | alias 组 `office` |
| 学校 | 100 | education | |
| 婚礼 | 100 | social | |
| 运动 | 100 | social | |
| 健身 | 100 | health | |

#### D. 出行 / 地理（Mock `travel` / `banner`）

| cat | 张数 | scene 默认 | 备注 |
| ------ | ------ | ------ | ------ |
| 旅行 | 100 | travel | |
| 风景 | 101 | banner | 宽图优先标注 orientation |
| 城市 | 101 | banner | |
| 中国城市 | 100 | banner | |
| 酒店 | 100 | hotel | |
| 露营 | 100 | travel | |
| 飞机 | 100 | travel | |
| 火车 | 100 | travel | |
| 轮船 | 100 | travel | |
| 汽车 | 100 | travel | |
| 摩托 | 100 | travel | |
| 自行车 | 100 | travel | |
| 无人机 | 100 | travel | |

#### E. 垂直行业

| cat | 张数 | scene 默认 | 备注 |
| ------ | ------ | ------ | ------ |
| 医院 | 100 | health | |
| 建筑 | 100 | realestate | 缺室内细分，见 §3 |
| 古建筑 | 100 | realestate | |
| 家具 | 100 | realestate | 偏单品，非户型 |
| 宠物 | 100 | social | |
| 动物 | 100 | social | |
| 游戏 | 100 | game | |
| 电竞 | 100 | game | |
| 动漫 | 100 | game | |

#### F. 装饰 / 纹理 / 风格（低 Mock 优先级）

> 可用于 Banner 背景、设计 Demo；**不建议**作为 Mock 列表主图。

| cat | 张数 | 说明 |
| ------ | ------ | ------ |
| 3DRender | 100 | 设计风 |
| AI插画 | 100 | 设计风 |
| CG | 100 | 设计风 |
| LowPoly | 100 | 设计风 |
| 像素风 | 100 | 设计风 |
| 赛博朋克 | 100 | 设计风 |
| 国风 | 100 | Banner / 节日 |
| 极简 | 100 | Banner 背景 |
| 抽象艺术 | 100 | 背景 |
| 水彩 | 100 | 背景 |
| 木纹 | 101 | 纹理 |
| 纹理 | 100 | 纹理 |
| 纸张 | 100 | 纹理 |
| 玻璃 | 100 | 纹理 |
| 金属 | 100 | 纹理 |
| 石头 | 100 | 纹理 |
| 天空 | 100 | 背景 |
| 天气 | 100 | 背景 |
| 太空 | 100 | 背景 |
| 海洋 | 100 | 背景 |
| 森林 | 100 | 背景 |
| 植物 | 100 | 背景 |
| 植物盆栽 | 100 | 背景 |
| 烟花 | 100 | 节日 |
| 节日 | 100 | promo |
| 科技 | 101 | saas / B 端 |

---

## 3. 分类缺口（待补全）

### 3.1 必须新增（P0 · 补前 Mock 专业场景明显失真）

| 优先级 | 建议 cat 名 | 目标张数 | 主要 scene | Pexels 检索词（参考） | 构图要求 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| **P0** | **新闻** | 100 | news | `news editorial event` | 横图；人物+场景 |
| **P0** | **电商主图** | 100 | product | `product white background` | 白底；单品居中 |
| **P0** | **室内** | 100 | realestate | `interior living room` | 客厅/卧室/厨房 |
| **P1** | **商务** | 100 | business | `business meeting handshake` | 会议、商务人像 |
| **P1** | **美妆** | 100 | product | `cosmetic product white` | 白底优先 |
| **P1** | **母婴** | 100 | product | `baby product maternity` | 婴儿用品 |
| **P1** | **餐饮门店** | 100 | food | `restaurant dining` | 店面/就餐环境 |

**补全后 cat 总数**：73 → **80**（+7）。机读目录见 [图库分类目录.json](./图库分类目录.json)。

### 3.2 建议增强（不新增 cat，改 manifest 标注）

| 项 | 做法 | 原因 |
| ------ | ------ | ------ |
| **Banner 宽图** | `风景`/`城市`/`国风` 标 landscape + 16:9 | 不另建 Banner 类 |
| **竖版 Feed** | `人物` 等标 portrait | Story / 短视频槽位 |
| **方形商品** | `电商主图` + `数码产品` 标 square | 列表缩略图 |
| **医生/医疗** | `医院` 内 tag `medical-staff` | 问诊 App 封面 |

### 3.3 可暂不补（现有 73 类可覆盖）

| 场景 | 现有 cat 组合 | 说明 |
| ------ | ------ | ------ |
| 游戏社区 | 游戏 + 电竞 + 动漫 | 足够 |
| 宠物 App | 宠物 + 动物 | 足够 |
| 出行票务 | 飞机 + 火车 + 汽车 + 酒店 | 足够 |
| 运动健康 | 健身 + 运动 + 医院 | 足够 |
| 节日促销 | 节日 + 礼物 + 烟花 | 足够 |

### 3.4 冗余 cat（不删目录，manifest 用 alias 合并）

采集时可继续分目录存盘；**对外 API / Mock 轮转**时按 alias 组去重，避免同屏出现「咖啡」和「咖啡馆」相邻重复感。

| alias 组 id | 包含 cat | Mock 轮转策略 |
| ------ | ------ | ------ |
| `digital` | 数码产品、电子产品、手机、电脑、耳机、键盘、鼠标 | product scene 内 `{id} % 7` 选组内 cat |
| `cafe` | 咖啡、咖啡馆 | food scene 内合并 |
| `office` | 办公、办公桌 | article / business 共用 |
| `nature-bg` | 森林、植物、植物盆栽、天空、海洋 | banner 背景池 |
| `texture` | 木纹、纹理、纸张、玻璃、金属、石头 | 仅 `?cat=` 浏览，不进 Mock 默认池 |

---

## 4. scene 标签规范

### 4.1 标准 scene 列表（一期 Mock 映射用）

| scene slug | 中文名 | 映射 cat（轮转池） | Mock 字段（规划） |
| ------ | ------ | ------ | ------ |
| `product` | 商品 | 电商主图 + digital 组 + 服装等 | `products.image` |
| `news` | 新闻资讯 | **新闻** + 城市 + 人物 + 运动 + 科技 | `posts.cover`（待增） |
| `article` | 文章/博客 | 书籍 + office 组 + 咖啡 | `posts.cover` 备选 |
| `food` | 餐饮 | 美食 + 甜品 + 饮料 + cafe 组 + **餐饮门店** | 扩展 mock/restaurants |
| `travel` | 出行 | 旅行 + 飞机 + 火车 + 汽车 + 露营 | 扩展 mock/trips |
| `hotel` | 酒店民宿 | 酒店 + 室内（补全后） | 扩展 mock/hotels |
| `banner` | 首页轮播 | 风景 + 城市 + 国风 + 极简 + 节日 | 手动 URL |
| `social` | 社交动态 | 人物 + 宠物 + 婚礼 + 运动 | 扩展 mock/feeds |
| `education` | 教育 | 学校 + 书籍 + office 组 | 扩展 mock/courses |
| `health` | 健康医疗 | 医院 + 健身 + 运动 | 扩展 mock/clinics |
| `realestate` | 房产家居 | **室内** + 家具 + 建筑 | 扩展 mock/listings |
| `business` | 商务金融 | **商务** + 科技 + office 组 | B 端 Landing |
| `game` | 游戏 | 游戏 + 电竞 + 动漫 | 扩展 mock/games |
| `promo` | 促销活动 | 节日 + 礼物 + 烟花 | 活动页 |
| `gallery` | 图集混排 | 多 cat 按 id 哈希 | 相册 Demo |

### 4.2 scene 与 cat 优先级

同一 scene 内选图顺序：

1. **专类优先**：如 `product` 先 `电商主图`，再 digital 组。
2. **id 确定性**：`photoId = (sceneHash(seed || id) % poolSize) + 1`。
3. **alias 组内**用 `id % groupSize` 选 cat，组内再用 `id` 选张。

---

## 5. 单张 meta.json 规范（采集侧）

与现有文件兼容，**在 `_meta.json` 基础上扩展**（上传 COS 前批量补字段）。

### 5.1 必填字段

```json
{
  "pexels_id": 5651859,
  "category": "风景",
  "photographer": "Vitalii Odobesku",
  "photographer_url": "https://www.pexels.com/zh-cn/@odobesku",
  "pexels_url": "https://www.pexels.com/zh-cn/photo/5651859/",
  "width": 4032,
  "height": 3024,
  "avg_color": "#768A8F",
  "downloaded_at": "2026-07-02 17:41:17"
}
```

### 5.2 上传前新增字段（脚本生成）

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| `id` | number | 全局唯一 1…N（manifest 主键，与 picsum `/id/` 对齐） |
| `scenes` | string[] | 所属 scene slug，至少 1 个 |
| `orientation` | string | `landscape` \| `portrait` \| `square`（按宽高比自动算） |
| `aspect` | string | 如 `16:9`、`4:3`、`1:1` |
| `tags` | string[] | 可选：`white-bg`、`indoor`、`close-up` |
| `alias_group` | string \| null | 如 `digital`、`cafe` |
| `mock_priority` | number | 1–3；1=优先进入 Mock 池，3=仅装饰/纹理 |

### 5.3 orientation 自动规则

| 条件 | orientation |
| ------ | ------ |
| `width / height > 1.2` | landscape |
| `height / width > 1.2` | portrait |
| 其余 | square |

---

## 6. 全局 manifest 规范（COS 侧）

### 6.1 文件位置

```text
devimage-125xxxxxx/
├── assets/seed-pack/              # 原图（按 cat 目录）
│   ├── 美食/pexels_31771044.jpeg
│   └── ...
├── manifest/
│   ├── photos.json                # 全量索引
│   ├── categories.json            # cat 列表 + 张数 + alias 组
│   └── scenes.json                # scene → cat 映射表
└── photos/{id}/{w}x{h}.webp       # Sharp 裁剪缓存（API 写入）
```

### 6.2 photos.json 单条示例

```json
{
  "id": 42,
  "cat": "电商主图",
  "scenes": ["product"],
  "orientation": "square",
  "aspect": "1:1",
  "width": 3000,
  "height": 3000,
  "avg_color": "#F5F5F5",
  "mock_priority": 1,
  "alias_group": null,
  "cos_key": "assets/seed-pack/电商主图/pexels_12345678.jpeg",
  "pexels_id": 12345678,
  "photographer": "Example Author"
}
```

### 6.3 categories.json 示例

```json
{
  "version": 1,
  "total": 7800,
  "categories": [
    { "slug": "美食", "count": 101, "scenes": ["food"], "alias_group": null },
    { "slug": "咖啡", "count": 100, "scenes": ["food"], "alias_group": "cafe" }
  ],
  "alias_groups": {
    "digital": ["数码产品", "电子产品", "手机", "电脑", "耳机", "键盘", "鼠标"],
    "cafe": ["咖啡", "咖啡馆"]
  }
}
```

---

## 7. 补全任务清单（采集用）

按优先级勾选，**开发 API 前完成**。

### 7.1 P0（必补 · 500 张）

- [ ] **新闻** × 100 — 横图 ≥ 60%；含人物或事件
- [ ] **电商主图** × 100 — 白底/纯色底 ≥ 70%；单品清晰
- [ ] **室内** × 100 — 客厅/卧室/厨房/卫生间 均衡
- [ ] 为上述 3 类 + 现有主力 cat 批量跑 `orientation` / `scenes` / `mock_priority` 脚本
- [ ] 生成全局 `id`（1 起连续，不按 cat 分段）

### 7.2 P1（建议补 · 200 张）

- [ ] **商务** × 100
- [ ] **餐饮门店** × 100
- [ ] 从 `风景`/`城市` 标注 ≥ 30 张 `mock_priority: 1` 的 banner 候选（16:9）

### 7.3 P1 元数据（不增图）

- [ ] 全库 7300+ 张补 `orientation` / `aspect`
- [ ] 全库补 `scenes[]`（至少 1 个）
- [ ] 装饰类 cat（§2.1 F 组）统一 `mock_priority: 3`
- [ ] 输出 `manifest/photos.json` + `categories.json` + `scenes.json`

### 7.4 验收标准（上传 COS 前）

| 项 | 标准 |
| ------ | ------ |
| P0 三类存在且各 ≥ 95 张 | 新闻、电商主图、室内 |
| 每 scene 轮转池 ≥ 200 张可用图 | 含 mock_priority 1–2 |
| `product` scene 白底图 ≥ 80 张 | 来自「电商主图」 |
| `news` scene 横图 ≥ 80 张 | 来自「新闻」+ 标注 |
| 全局 id 无重复 | photos.json 校验 |
| 版权字段完整 | 100% 含 pexels_id + photographer |

---

## 8. API 预留（本文不实现，仅对齐命名）

| 路由 | 参数 | 说明 |
| ------ | ------ | ------ |
| `GET /photo/:w/:h` | `?cat=` `?scene=` `?seed=` | 随机或 seed 确定性 |
| `GET /id/:id/:w/:h` | `?grayscale=` `?blur=` | picsum 兼容 |
| `GET /v2/list` | `?page=` `?limit=` `?cat=` | 列表 |

**参数优先级**：`id` > `seed` > `scene` > `cat` > 全库随机。

---

## 9. 决策记录

| 日期 | 决策 |
| ------ | ------ |
| 2026-07-03 | 确立 cat + scene 双层 taxonomy |
| 2026-07-03 | P0 缺口：新闻、电商主图、室内（各 100 张） |
| 2026-07-03 | P1 缺口：商务、餐饮门店 |
| 2026-07-03 | 装饰/纹理类保留但不进 Mock 默认池 |
| 2026-07-03 | P1 缺口扩展：美妆、母婴；digital 组停止扩展 |
| 2026-07-03 | 发现 meta 缺口 6765/7502；阶段一优先补 meta |
| 2026-07-03 | 新增 [图库自动化采集规范](./图库自动化采集规范.md) + [图库分类目录.json](./图库分类目录.json) |

---

## 10. 相关文档

| 文档 | 说明 |
| ------ | ------ |
| [占位与场景差异化规划](./占位与场景差异化规划.md) | `/photo` 二期排期 |
| [竞品 URL 与 API 对照表](./竞品URL与API对照表.md) | picsum 兼容路由 |
| [腾讯云 COS 部署指南](./腾讯云COS部署指南.md) | 上传路径与 CDN |
