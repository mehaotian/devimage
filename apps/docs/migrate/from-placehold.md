# 从 placehold 迁移

[placehold.co](https://placehold.co) 的尺寸与配色写法可映射到图即。生产环境 CDN 基址为 `https://cdn.devimg.cn`。

## 对照表

| placehold.co | 图即 |
| -------------- | ------ |
| `/600x400` | `/600x400` 或 `/600/400` |
| `/600x400/EEE/31343C?text=Hello` | `/600/400/eee/31343C?text=Hello` 或 `/600/400?bg=eee&fg=31343C&text=Hello` |
| `/600x400.webp` | `/600x400.webp` 或 `/600/400?format=webp` |
| `/600x400.svg` | `/600/400.svg` |

颜色参数亦支持 query：`bg` / `fg`，以及别名 `bc` / `tc`。

## 示例

```diff
- https://placehold.co/600x400?text=Hello
+ https://cdn.devimg.cn/600/400?text=Hello
```

```diff
- https://placehold.co/600x400/409eff/ffffff?text=Banner
+ https://cdn.devimg.cn/600/400?bg=409eff&fg=ffffff&text=Banner
```

## 差异

- 图即默认输出 **SVG**；placehold 常见为 PNG/SVG，按原链接后缀选择即可
- 尺寸范围 **10–4000**；文字最长 50 字符
- 栅格（WebP / PNG）单边上限 **1024**，限流 60 次/分钟/IP

完整参数见 [占位图 API](/api/placeholder)。
