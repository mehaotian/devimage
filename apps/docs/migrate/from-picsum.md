# 从 picsum 迁移

若项目中已使用 [picsum.photos](https://picsum.photos)，可将域名替换为图即 CDN，再按路径选择合成占位或真实照片。

生产环境 CDN 基址为 `https://cdn.devimg.cn`。

## 对照表

| picsum | 图即 | 说明 |
| -------- | ------ | ------ |
| `/800/600` | `/800/600` | 合成色块占位 |
| `/800/600` | `/photo/800/600` | 真实照片，无 seed 时随机 |
| `/seed/x/800/600` | `/seed/x/800/600` | 合成图，固定配色 |
| `/seed/x/800/600` | `/photo/800/600?seed=x` | 真实照片，固定选图 |
| `/id/237/800/600` | `/id/237/800/600` | 按图库 id；id 空间与 picsum 不同 |
| `?grayscale` | `/photo/...?grayscale=1` | 灰度，用于照片路由 |
| `?blur=2` | `/photo/...?blur=2` | 模糊 1–10 |

`/:w/:h` 在图即中是合成占位，**不会**返回照片。需要照片请使用 `/photo/...` 或 `/id/...`。

## 迁移步骤

1. 替换域名：

    ```diff
    - https://picsum.photos
    + https://cdn.devimg.cn
    ```

2. 若只需色块占位，路径可保持 `/800/600`：

    ```html
    <img src="https://cdn.devimg.cn/800/600" alt="placeholder" />
    ```

3. 若需要真实照片，改为 `/photo` 或 `/id`：

    ```html
    <img src="https://cdn.devimg.cn/photo/800/600?seed=hero" alt="photo" />
    <img src="https://cdn.devimg.cn/id/1/800/600" alt="photo by id" />
    ```

参数与缓存见 [真实照片 API](/api/photo)、[占位图 API](/api/placeholder)。

## Next.js Image 示例

```tsx
<Image
  src="https://cdn.devimg.cn/seed/demo/800/600"
  alt="placeholder"
  width={800}
  height={600}
/>
```

## CSP

```text
img-src https://cdn.devimg.cn;
connect-src https://cdn.devimg.cn;
```
