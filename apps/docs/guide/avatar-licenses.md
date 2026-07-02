# 头像许可与致谢

DevImage 头像由**多种引擎**组成，许可责任按 **自研 / 三方** 区分。

---

## 引擎类型

| engine | 类型 | 说明 | 许可责任 |
| ------ | ------ | ------ | ---------- |
| `native` | 自研 | 图即自研 SVG 算法 | DevImage 项目许可，可商用 |
| `partner` | 三方接入 | DiceBear、Jdenticon、Minidenticons | 各 style / 库独立许可 |
| `composite` | 自研（规划） | PNG 部件拼接 | 自有美术资源 |

查询完整列表：`GET /avatar/styles`。风格说明见 [头像 API · 风格目录](/api/avatar#风格目录)。

---

## 三方库一览

| provider | 库 / 站点 | npm | 协议 | DevImage 风格数 |
| ------ | ------ | ------ | ------ | ------: |
| `dicebear` | [DiceBear](https://www.dicebear.com/) | [@dicebear/core](https://www.npmjs.com/package/@dicebear/core) | 引擎 MIT | 37 |
| `jdenticon` | [jdenticon.com](https://jdenticon.com/) | [jdenticon](https://www.npmjs.com/package/jdenticon) | MIT | 1 |
| `minidenticons` | [GitHub](https://github.com/laem/minidenticons) | [minidenticons](https://www.npmjs.com/package/minidenticons) | MIT | 1 |

---

## 自研风格（native）

| style | 名称 | 许可 | 备注 |
| ------ | ------ | ------ | ------ |
| devimg | 图即头像 | DevImage | 主入口；`variant` / `text` / `bg` / `fg` |
| devimg-geo | 几何弧环 | DevImage | 独立几何风格 |
| devimg-pattern | 纹理 pattern | DevImage | CSS 纹理满铺；`pattern` / `shape` / `text` / `fg` |
| devimg-gradient | 渐变圆 | DevImage | `devimg` 别名 |
| devimg-mesh | 网格渐变 | DevImage | `devimg` 别名 |
| devimg-initials | 渐变首字 | DevImage | `devimg` 别名 |

自研风格无第三方署名要求；输出 SVG **不含**第三方生成注释。

---

## 开源接入（partner · DiceBear）

- 渲染引擎：[@dicebear/core](https://www.npmjs.com/package/@dicebear/core) — MIT
- 风格定义：[@dicebear/styles](https://www.npmjs.com/package/@dicebear/styles)
- 许可详情：[DiceBear Licenses](https://www.dicebear.com/licenses/)

### 需署名的 style（CC BY 4.0）

| style | 作者 |
| ------ | ------ |
| adventurer | Lisa Wischofsky |
| adventurer-neutral | Lisa Wischofsky |
| micah | Micah Lanier |
| personas | Draftbit |
| big-smile | Ashley Seaman · The Visual Team |
| big-ears | The Visual Team |
| big-ears-neutral | The Visual Team |
| dylan | Dylan S |

### 免费商用 style（作者声明）

| style | 作者 |
| ------ | ------ |
| avataaars | Pablo Stanley |
| avataaars-neutral | Pablo Stanley |
| bottts | Pablo Stanley |
| bottts-neutral | Pablo Stanley |

### CC0 / MIT style

多数 DiceBear 几何 / 角色风格为 CC0；`icons` 为 Bootstrap Icons（MIT）。完整列表见 [头像 API](/api/avatar#三方接入--dicebear)。

---

## Jdenticon（partner · MIT）

| 项目 | 链接 |
| ------ | ------ |
| style | `jdenticon` |
| 站点 | [jdenticon.com](https://jdenticon.com/) |
| npm | [jdenticon](https://www.npmjs.com/package/jdenticon) |

---

## Minidenticons（partner · MIT）

| 项目 | 链接 |
| ------ | ------ |
| style | `minidenticon` |
| 仓库 | [laem/minidenticons](https://github.com/laem/minidenticons) |
| npm | [minidenticons](https://www.npmjs.com/package/minidenticons) |

---

## 相关链接

- [头像 API · 风格目录](/api/avatar#风格目录)
- [使用规范与公平使用](/guide/fair-use)
- [头像 API 试玩](/api/avatar)
