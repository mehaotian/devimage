---
layout: home

hero:
  name: DevImage
  text: 国内开发者占位 CDN
  tagline: 替代 picsum 慢速问题 · 占位图 · 头像 · Mock 数据 · 场景图
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: API 文档
      link: /api/placeholder

features:
  - title: 国内极速
    details: 腾讯云 CDN + COS，大陆节点加速，SVG 毫秒级响应，告别跨境 picsum 延迟。
  - title: 零配置 URL
    details: 复制即用，兼容 picsum / placehold 常见 URL 模式。
  - title: 场景化占位
    details: 404、空状态、字母头像、Mock JSON，开发全流程覆盖。
  - title: 开源可自托管
    details: Node.js + NestJS + TypeScript，Docker 一键部署。
---

## 一行上手

```html
<img src="http://localhost:3000/800/600" alt="placeholder" />
<img src="http://localhost:3000/avatar/张三/128" alt="avatar" />
```

```javascript
const res = await fetch('http://localhost:3000/mock/users');
const users = await res.json();
```

## 本地开发

```bash
pnpm install
pnpm dev          # 同时启动 API :3000 + 文档 :5173
```
