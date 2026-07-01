---
name: devimage-deploy
description: >-
  Deploys DevImage to Tencent Cloud (Lighthouse/CVM) with COS object storage
  and CDN. Use when configuring production deployment, COS bucket, CDN caching,
  Nginx, PM2, or domestic access optimization.
---

# DevImage 部署（腾讯云 + COS）

## 标准架构

```
腾讯云 CDN (cdn.devimage.cn / devimage.cn)
  → 轻量服务器 Nginx :443
      → NestJS API :3000 (PM2)
  → COS (photos/ 缓存，Phase 2)
```

## 资源清单

| 产品 | 用途 |
|------|------|
| 轻量应用服务器 | API + Nginx |
| COS | photo 缓存、精选图包 |
| CDN | 国内加速（需备案） |
| CAM 子账号 | 仅授予 COS 读写 |

## 构建与启动

```bash
pnpm install && pnpm build
cp apps/api/.env.example apps/api/.env
# 填入 TENCENT_SECRET_ID / COS_BUCKET 等
pm2 start apps/api/dist/main.js --name devimage-api
```

## 环境变量

见 `apps/api/.env.example`：

- `COS_REGION` — 与轻量同地域，如 `ap-guangzhou`
- `COS_BUCKET` — `devimage-1250000000`
- `COS_PHOTO_PREFIX` — `photos/`
- `COS_CDN_DOMAIN` — CDN 自定义域名（可选）

## COS 目录

```
photos/{id}/{w}x{h}.webp   # API 异步写入
assets/seed-pack/          # CC0 精选包
```

## 缓存策略

- SVG 合成（`/:w/:h`）：API 实时生成，CDN 短缓存
- seed/avatar：CDN 长缓存 immutable
- photo：写 COS → 302 到 CDN URL

## 成本参考

见 [docs/Freemium定价与成本模型.md](../../docs/Freemium定价与成本模型.md)

## 详细文档

- [docs/腾讯云COS部署指南.md](../../docs/腾讯云COS部署指南.md)
- [apps/docs/guide/deployment.md](../../apps/docs/guide/deployment.md)

## 禁止

- 不要用 Cloudflare Workers 作为国内生产主力
- photo 禁止同步拉 Pexels；必须 COS 缓存
- 勿将 SecretKey 提交 Git
