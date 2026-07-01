# 部署指南

DevImage 生产环境采用 **腾讯云轻量应用服务器 + COS 对象存储 + CDN**。

详细步骤见规划文档 [腾讯云 COS 部署指南](../../docs/腾讯云COS部署指南.md)。

---

## 架构

```text
开发者
  → 腾讯云 CDN（cdn.devimage.cn / devimage.cn）
      → Nginx（轻量服务器）
          → NestJS API :3000
      → COS（/photo 缓存图，Phase 2）
```

| 组件 | 用途 |
| ------ | ------ |
| 轻量/CVM | API 进程、Nginx |
| COS | 照片缓存、精选图包 |
| CDN | 国内加速（需 ICP 备案） |
| PM2 | Node 进程守护 |

---

## 构建

```bash
pnpm install
pnpm build
```

---

## 环境变量

复制 `apps/api/.env.example` 为 `.env`：

```bash
cp apps/api/.env.example apps/api/.env
```

| 变量 | 说明 |
| ------ | ------ |
| `PORT` | API 端口，默认 3000 |
| `TENCENT_SECRET_ID` | 腾讯云 CAM 子账号 SecretId |
| `TENCENT_SECRET_KEY` | CAM SecretKey（仅 COS 权限） |
| `COS_REGION` | 如 `ap-guangzhou` |
| `COS_BUCKET` | 如 `devimage-1250000000` |
| `COS_PHOTO_PREFIX` | 照片缓存前缀，默认 `photos/` |
| `COS_CDN_DOMAIN` | COS 绑定的 CDN 域名（可选） |

---

## PM2 启动 API

```bash
cd /var/www/devimage
pm2 start apps/api/dist/main.js --name devimage-api
pm2 save && pm2 startup
```

---

## Nginx（腾讯云轻量服务器）

```nginx
upstream devimage_api {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name cdn.devimage.cn;

    ssl_certificate     /etc/nginx/ssl/cdn.pem;
    ssl_certificate_key /etc/nginx/ssl/cdn.key;

    location / {
        proxy_pass http://devimage_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name devimage.cn;

    root /var/www/devimage/apps/docs/.vitepress/dist;
    try_files $uri $uri/ /index.html;
}
```

---

## COS 存储结构

```text
devimage-125xxxxxx/
├── photos/{id}/{w}x{h}.webp    # API 写入的缓存图
└── assets/seed-pack/           # CC0 精选图包
```

---

## CDN 配置要点

1. 域名 **ICP 备案** 后接入腾讯云 CDN
2. `cdn.devimage.cn` 源站指向轻量服务器公网 IP
3. `/seed/*`、`/avatar/*` 配置较长缓存（immutable）
4. Phase 2：`/photo/*` 可 302 到 COS CDN 域名

---

## 缓存策略

| 路由 | Cache-Control | CDN |
| ------ | --------------- | ----- |
| `/seed/*` | immutable, 1y | 长缓存 |
| `/avatar/*` | immutable, 1y | 长缓存 |
| `/:w/:h` 随机 | 1h | 短缓存 |
| `/mock/*` | 5min | 短缓存 |
| `/photo/*` | immutable | COS + CDN |

---

## 监控

- 健康检查：`GET /health`
- 腾讯云可观测平台 / 云监控
- PM2：`pm2 logs devimage-api`

---

## 预估成本（MVP）

| 项目 | 月费 |
| ------ | ------ |
| 轻量 2C4G | ¥45–65 |
| COS + CDN 按量 | ¥10–30 |
| **合计** | **¥55–95** |

详见 [Freemium 定价与成本模型](../../docs/Freemium定价与成本模型.md)。
