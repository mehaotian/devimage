# 从 placehold 迁移

[placehold.co](https://placehold.co) 的 URL 习惯可映射到 DevImage，见下表。

## 对照表

| placehold.co | DevImage |
| -------------- | ---------- |
| `/600x400` | `/600/400` |
| `/600x400/EEE/31343C?text=Hello` | `/600/400?bg=eee&fg=31343C&text=Hello` |
| `/600x400.webp` | Phase 1.5 支持 `.webp` |

## 示例

```diff
- https://placehold.co/600x400?text=Hello
+ https://cdn.devimage.cn/600/400?text=Hello
```

```diff
- https://placehold.co/600x400/409eff/ffffff?text=Banner
+ https://cdn.devimage.cn/600/400?bg=409eff&fg=ffffff&text=Banner
```

## 差异说明

- DevImage 默认输出 **SVG**（体积极小、无限缩放）
- 颜色参数统一为 query：`bg` / `fg`（也兼容文档中的 `bc`/`tc` 别名，Phase 2）
