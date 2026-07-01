# 从 picsum 迁移

[picsum.photos](https://picsum.photos) 在国内访问慢。DevImage 提供兼容 URL 与国内节点。

## 对照表

| picsum | DevImage（当前） | 说明 |
| -------- | ------------------ | ------ |
| `/800/600` | `/800/600`（合成）或 `/photo/800/600`（Phase 2 真实图） | MVP 先用合成占位 |
| `/seed/x/800/600` | `/seed/x/800/600` | ✅ 已支持 |
| `/id/237/800/600` | `/id/237/800/600` | Phase 2 |
| `?grayscale` | `?grayscale=1` | Phase 2 |
| `?blur=2` | `?blur=2` | Phase 2 |

## 迁移步骤

1. 全局替换域名：

```diff
- https://picsum.photos
+ https://cdn.devimage.cn
```

2. 若只需色块占位，路径不变：

```html
<img src="https://cdn.devimage.cn/800/600" />
```

3. 若需要真实照片，等待 Phase 2 `/photo` 或使用 `/seed` 固定合成图。

## Next.js Image 示例

```tsx
<Image
  src="https://cdn.devimage.cn/seed/demo/800/600"
  alt="placeholder"
  width={800}
  height={600}
/>
```

## CSP 配置

```text
img-src https://cdn.devimage.cn;
connect-src https://cdn.devimage.cn;
```
