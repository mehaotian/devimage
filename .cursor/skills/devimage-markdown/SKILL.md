---
name: devimage-markdown
description: >-
  DevImage 仓库 Markdown 格式规范（markdownlint）。编写或修改 README、docs/、
  apps/docs/、.cursor/skills/ 下 .md 时使用，避免 MD060 表格、MD040 代码块语言、
  MD034 裸链接、MD056 列数错误、MD036 加粗伪标题等 lint 警告。
---

# DevImage Markdown 规范

本仓库使用 [markdownlint](https://github.com/DavidAnson/markdownlint) 默认规则。
生成或修改 Markdown 时**必须**遵守下列约定。

## 适用范围

- `README.md`
- `docs/**/*.md`（产品规划）
- `apps/docs/**/*.md`（VitePress 用户文档）
- `.cursor/skills/**/*.md`

## 1. 表格（MD060 compact 风格）

**所有表格行**（表头、分隔行、数据行）统一格式：每个 `|` 两侧各有一个空格。

```markdown
| 服务 | 地址 |
| ------ | ------ |
| API | <http://localhost:3000> |
| Swagger | <http://localhost:3000/api/docs> |
```

### 表格反例

```markdown
|------|------|          ❌ 分隔行 pipe 无空格
|API|http://...|          ❌ 数据行 pipe 无空格
```

### 单元格含 `|` 字符

用反引号包裹整段，或对 pipe 转义 `\|`：

```markdown
| 参数 | 取值 |
| ------ | ------ |
| grayscale | `0\|1` |
| variant | `no-data\|search\|network` |
```

## 2. 链接（MD034）

| 场景 | 写法 |
| ------ | ------ |
| 表格中的 URL | 尖括号：`<http://localhost:3000>` |
| 正文外链 | Markdown 链接：`[picsum.photos](https://picsum.photos)` |
| 代码块 / 反引号内 | 保持原样，**不要**再套尖括号 |
| HTML/JS 示例中的 src | 写在 \`\`\`html 块内，lint 不检查 |

### 链接反例

在表格单元格里写裸 URL（无 `<>`、无 `[]()`、无反引号）。

## 3. 围栏代码块（MD040）

Opening fence **必须**带语言标识，禁止单独 ` ``` `。

| 内容类型 | 语言标识 |
| ------ | ------ |
| 目录树、架构示意、纯文本清单 | `text` |
| HTTP 路由 / 响应头 | `http` |
| Shell / 部署命令 | `bash` |
| Nginx 配置 | `nginx` |
| JSON 响应示例 | `json` |
| HTML 示例 | `html` |
| JavaScript | `javascript` 或 `js` |
| TypeScript | `typescript` |
| Mermaid 图 | `mermaid` |
| Markdown 片段示例 | `markdown` |
| 环境变量 / CSP | `text` |

### 示例

````markdown
```text
apps/api/src/
├── placeholder/
└── avatar/
```

```http
GET /mock/users
GET /mock/users?count=20
```

```bash
pnpm install && pnpm dev
```
````

## 4. 标题（MD036 / MD024 / MD001）

### 禁止用加粗代替标题（MD036）

单独一行的 `**Path 参数**`、`**示例**` 等会触发 MD036，应改为真实标题。

```markdown
#### 5.1.1 `GET /:width/:height`

##### 5.1.1 Path 参数

| 参数 | 类型 | ...
```

### 标题层级

- 父级是 `#### 5.1.1` 时，子节用 `#####`（h5）
- 父级是 `### 6.1` 且无 `####` 时，子节用 `####`（h4），**不要跳级**

### 避免重复标题（MD024）

同一文档内多次出现「Path 参数」等通用名时，**加章节前缀**：

```markdown
##### 5.1.1 Path 参数
##### 5.1.2 Path 参数
##### 5.2.1 Path 参数
```

行内说明仍可用加粗：`**用途**：替代 placehold.co …`（同行有正文，不触发 MD036）。

## 5. 提交前验证

在仓库根目录执行（排除 node_modules）：

```bash
npx --yes markdownlint-cli2 \
  "README.md" \
  "docs/*.md" \
  "apps/docs/api/*.md" \
  "apps/docs/guide/*.md" \
  "apps/docs/migrate/*.md" \
  "apps/docs/index.md" \
  ".cursor/skills/**/*.md"
```

目标：**MD040、MD060、MD034、MD056、MD036 为零**。
MD024（重复标题）、MD001（跳级）一并避免。MD013 行宽等非阻塞。

## 6. 与其他 Skill 的关系

- 写 VitePress API 文档 → 同时遵循 [devimage-docs](../devimage-docs/SKILL.md)
- 写部署相关 md → 同时遵循 [devimage-deploy](../devimage-deploy/SKILL.md)
- 新建 Skill 文件 → 本规范 + Skill frontmatter 要求

## 快速 Checklist

- [ ] 表格分隔行为 `| ------ | ------ |`（非 `|------|------|`）
- [ ] 表格数据行 pipe 两侧有空格
- [ ] 表格内 URL 用 `<>` 或反引号
- [ ] 所有 ` ``` ` 块已标注语言
- [ ] 单元格含 `|` 已转义或反引号包裹
- [ ] 子节标题用 `#` 而非单独一行 `**加粗**`
- [ ] 重复子节名已加章节前缀（如 `##### 5.1.1 Path 参数`）
- [ ] 标题层级连续（h3→h4→h5，不跳级）
- [ ] 已跑 markdownlint-cli2 无表格/链接/代码块/标题类错误
