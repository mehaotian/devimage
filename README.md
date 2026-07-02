# DevImage

国内开发者占位资源 CDN — 替代 [picsum.photos](https://picsum.photos) 国内慢速问题。

占位图 · 头像 · 404/空状态 · Mock JSON · 统一 URL API

## 技术栈

- **API**: Node.js + TypeScript + NestJS (Fastify)
- **文档站**: VitePress
- **基础设施**: 腾讯云轻量 + COS + CDN
- **包管理**: pnpm monorepo

## 快速开始

> 本项目为 **pnpm monorepo**，依赖在 `apps/api` 与 `apps/docs` 子包中。  
> 根目录执行 `pnpm install` 会安装全部 workspace 依赖。

```bash
# 1. 安装 pnpm（若未安装）
corepack enable
corepack prepare pnpm@9.15.0 --activate

# 2. 安装依赖（必须在仓库根目录执行）
pnpm install

# 3. 启动开发环境（API + 文档站）
pnpm dev
```

| 服务 | 地址 |
| ------ | ------ |
| API | <http://localhost:3000> |
| Swagger | <http://localhost:3000/api/docs> |
| 文档站 | <http://localhost:5173> |

## 示例

```html
<img src="http://localhost:3000/800/600" />
<img src="http://localhost:3000/seed/demo/800/600" />
<img src="http://localhost:3000/avatar/devimg/张三/128" />
<img src="http://localhost:3000/scene/404" />
```

```javascript
fetch('http://localhost:3000/mock/users').then((r) => r.json());
```

## 项目结构

```text
DevImage/
├── apps/
│   ├── api/          # NestJS API
│   └── docs/         # VitePress 文档站
├── docs/             # 产品规划文档（中文）
├── .cursor/
│   ├── rules/        # Cursor AI 规则
│   └── skills/       # Cursor Agent Skills
└── package.json
```

## 规划文档

见 [docs/](./docs/README.md)，核心文档：[完整开发文档](./docs/完整开发文档.md)（功能、参数、一期/二期/三期规划）

## License

MIT
