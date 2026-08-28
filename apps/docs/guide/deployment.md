# 部署指南

DevImage 生产环境采用 **腾讯云轻量应用服务器 + COS 对象存储 + CDN**。

详细步骤见：

- [腾讯云 COS 部署指南](../../docs/腾讯云COS部署指南.md)
- [生产部署与运维手册](../../docs/生产部署与运维手册.md)（`pnpm deploy` 启停与发版）

---

## 架构

```text
开发者
  → 腾讯云 CDN（cdn.devimg.cn）
      → Nginx（轻量服务器 :80）
          → NestJS API :3010
  → https://devimg.cn（文档站，源站 Nginx + Let's Encrypt）
```

| 组件 | 用途 |
| ------ | ------ |
| 轻量/CVM | API 进程、Nginx |
| COS | 照片缓存、精选图包 |
| CDN | 占位图国内加速（需 ICP 备案） |
| PM2 | Node 进程守护 |

---

## 服务器一键发版

在服务器仓库根目录（如 `/home/ht/devimg`）：

```bash
pnpm deploy
```

等价于：`git pull` → 安装依赖与构建 → PM2 reload → 健康检查。

常用命令：

```bash
pnpm deploy:status
pnpm deploy:restart
pnpm deploy:logs
pnpm deploy:stop
pnpm deploy:start
```

本机构建文档站示例 URL 时：

```bash
VITE_API_BASE=https://cdn.devimg.cn \
VITE_DOCS_ORIGIN=https://devimg.cn \
pnpm build:docs
```

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
| `PORT` | API 端口；生产建议 `3010` |
| `DEVIMAGE_PUBLIC_URL` | 对外 CDN 根，如 `https://cdn.devimg.cn` |
| `TENCENT_SECRET_ID` | 腾讯云 CAM 子账号 SecretId |
| `TENCENT_SECRET_KEY` | CAM SecretKey（仅 COS 权限） |
| `COS_REGION` | 如 `ap-beijing` |
| `COS_BUCKET` | 如 `devimage-1250000000` |
| `COS_PHOTO_PREFIX` | 照片缓存前缀，默认 `photos/` |
| `COS_CDN_DOMAIN` | COS/CDN 域名（可选） |
| `VITE_API_BASE` | 文档构建时的 API 示例前缀 |
| `VITE_DOCS_ORIGIN` | 文档构建时的文档站地址 |

---

## PM2 启动 API

推荐使用仓库配置：

```bash
pnpm deploy:start
# 或
pm2 start deploy/ecosystem.config.cjs
pm2 save && pm2 startup
```

---

## Nginx（腾讯云轻量服务器）

生产参考 [`deploy/nginx/devimg.conf`](../../deploy/nginx/devimg.conf)。历史限流版见 [`deploy/nginx/devimage.conf`](../../deploy/nginx/devimage.conf)。

```bash
sudo cp deploy/nginx/devimg.conf /etc/nginx/sites-available/devimg
sudo ln -sfn /etc/nginx/sites-available/devimg /etc/nginx/sites-enabled/devimg
sudo nginx -t && sudo systemctl reload nginx
```

文档站 HTTPS：

```bash
sudo certbot --nginx -d devimg.cn -d www.devimg.cn
```

---

## CDN 注意点

1. 回源协议：**HTTP**，端口 **80**，HOST：`cdn.devimg.cn`
2. **HTTPS 配置**页：开启「HTTPS 服务」并绑定托管证书（用户访问用 HTTPS）
3. 若返回 `514`：检查 HTTPS 是否开启、IP 限频与黑白名单（见[腾讯云文档](https://cloud.tencent.com/document/product/228/56824)）

---

## 健康检查

```bash
curl -sS https://cdn.devimg.cn/health
curl -sS -o /dev/null -w "%{http_code}\n" https://cdn.devimg.cn/400/300
curl -sS -o /dev/null -w "%{http_code}\n" https://devimg.cn/
```
