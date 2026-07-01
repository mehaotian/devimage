---
name: devimage-api-route
description: >-
  Adds or modifies DevImage placeholder CDN API routes in NestJS (apps/api).
  Use when implementing new endpoints like /avatar, /mock, /scene, /photo,
  picsum compatibility, SVG generators, cache headers, or updating API docs md.
  Follow devimage-markdown when editing apps/docs/api/*.md.
---

# DevImage API 路由开发

> 同步更新 `apps/docs/api/*.md` 时遵循 [devimage-markdown](../devimage-markdown/SKILL.md)。

## 开始前

1. 阅读 [docs/竞品URL与API对照表.md](../../docs/竞品URL与API对照表.md) 确认 canonical URL
2. 阅读 [docs/MVP功能优先级PRD.md](../../docs/MVP功能优先级PRD.md) 确认优先级

## 新增路由 checklist

```markdown
- [ ] 创建 Module / Controller / Service
- [ ] Service 含函数级 JSDoc
- [ ] 尺寸/颜色参数校验（common/utils.ts）
- [ ] 设置正确的 Cache-Control
- [ ] 注册到 app.module.ts
- [ ] 添加 *.service.spec.ts
- [ ] 更新 apps/docs/api/*.md
- [ ] 更新 .vitepress/config.ts sidebar
```

## 模块模板

```typescript
// *.service.ts — 纯函数生成
@Injectable()
export class XxxService {
  /** 渲染 SVG */
  renderSvg(options: XxxOptions): string { /* ... */ }
}

// *.controller.ts
@Get('path')
@Header('Content-Type', 'image/svg+xml; charset=utf-8')
getXxx(): string {
  return this.service.renderSvg(/* ... */);
}
```

## 路由冲突

通配 `/:w/:h` 放在 placeholder 模块，仅 2 段路径。  
`seed/:seed/:w/:h` 为 4 段，不冲突。  
新根路径（如 `/photo`）用独立 `@Controller('photo')`。

## photo 模块（Phase 2）

- 禁止同步 fetch Pexels
- 未命中：返回合成图或异步写入 **腾讯云 COS**，302 到 CDN URL
- 环境变量见 `apps/api/.env.example`
- 详见 [docs/腾讯云COS部署指南.md](../../docs/腾讯云COS部署指南.md)

## 测试

```bash
pnpm --filter @devimage/api test
pnpm --filter @devimage/api dev
curl http://localhost:3000/800/600
```
