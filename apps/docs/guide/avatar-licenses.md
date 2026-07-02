# 头像许可与致谢

DevImage 头像由**多种引擎**组成，许可责任按引擎区分。

---

## 引擎类型

| engine | 说明 | 许可责任 |
| ------ | ------ | ---------- |
| `native` | 图即自研 SVG 算法 | DevImage 项目许可，可商用 |
| `partner` | 接入第三方开源库（当前为 DiceBear） | 各 style 独立许可 |
| `composite` | PNG 部件拼接（规划中） | 自有美术资源 |

查询完整列表：`GET /avatar/styles`，每条含 `engine`、`license`、`provider`。

---

## 自研风格（native）

| style | 名称 | 许可 |
| ------ | ------ | ------ |
| devimg-gradient | 渐变圆 | DevImage |
| devimg-mesh | 网格渐变 | DevImage |
| devimg-geo | 几何弧环 | DevImage |
| devimg-initials | 渐变首字 | DevImage |

自研风格无第三方署名要求；输出 SVG **不含**第三方生成注释。

---

## 开源接入（partner · DiceBear）

- 渲染引擎：`@dicebear/core` — [MIT](https://www.npmjs.com/package/@dicebear/core)
- 风格定义：`@dicebear/styles` — 各 style 许可见 [DiceBear Licenses](https://www.dicebear.com/licenses/)

### 需署名的 style（CC BY 4.0）

| style | 作者 |
| ------ | ------ |
| adventurer | Lisa Wischofsky |
| micah | Micah Lanier |

在 DevImage 文档或关于页保留上述署名即可；
**不要求**每个下游产品在页脚重复署名
（除非再分发 SVG 素材包）。

### CC0 / 免费商用 style

rings、identicon、lorelei、pixel-art、avataaars 等多数 partner 风格为 CC0 或作者声明免费商用，详见 DiceBear 许可页。

---

## 相关链接

- [使用规范与公平使用](/guide/fair-use)
- [头像 API 试玩](/api/avatar)
