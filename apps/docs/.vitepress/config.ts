import { defineConfig } from 'vitepress';

/** API / CDN 根地址：本地默认 localhost；生产构建传 VITE_API_BASE */
const API_BASE = process.env.VITE_API_BASE ?? 'http://localhost:3000';
/** 文档站对外地址：生产构建传 VITE_DOCS_ORIGIN=https://devimg.cn */
const DOCS_ORIGIN = process.env.VITE_DOCS_ORIGIN ?? 'http://localhost:5173';

/**
 * 构建时把 Markdown 里的本地示例 URL 替换为当前环境基址。
 * 源文件仍写 localhost，便于本地开发；线上文档自动变成 CDN / 正式域名。
 */
function rewriteDocExampleUrls(): {
  name: string;
  enforce: 'pre';
  transform: (code: string, id: string) => string | null;
} {
  return {
    name: 'devimage-rewrite-doc-example-urls',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.includes('/apps/docs/') || !id.endsWith('.md')) {
        return null;
      }
      let next = code;
      if (API_BASE !== 'http://localhost:3000') {
        next = next.split('http://localhost:3000').join(API_BASE);
      }
      if (DOCS_ORIGIN !== 'http://localhost:5173') {
        next = next.split('http://localhost:5173').join(DOCS_ORIGIN);
      }
      return next === code ? null : next;
    },
  };
}

export default defineConfig({
  title: 'devimg',
  description: '图即 — 国内开发者占位图 CDN。占位图、头像、真实照片、骨架屏与 Mock 数据。',
  lang: 'zh-CN',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png', type: 'image/png' }],
    ['meta', { name: 'theme-color', content: '#3b5bdb' }],
  ],
  themeConfig: {
    logo: { src: '/logo-nav.png', alt: 'devimg' },
    siteTitle: '图即',
    nav: [
      { text: '首页', link: '/' },
      { text: 'API 文档', link: '/api/placeholder' },
      { text: '功能一览', link: '/guide/dev-spec' },
      { text: '迁移', link: '/migrate/from-picsum' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '功能一览', link: '/guide/dev-spec' },
            { text: '使用规范', link: '/guide/fair-use' },
            { text: '头像许可', link: '/guide/avatar-licenses' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '占位图', link: '/api/placeholder' },
            { text: '骨架屏', link: '/api/skeleton' },
            { text: '头像', link: '/api/avatar' },
            { text: '码形占位', link: '/api/qr' },
            { text: '场景图', link: '/api/scene' },
            { text: '真实照片', link: '/api/photo' },
            { text: 'Mock 数据', link: '/api/mock' },
          ],
        },
      ],
      '/migrate/': [
        {
          text: '迁移指南',
          items: [
            { text: '从 picsum 迁移', link: '/migrate/from-picsum' },
            { text: '从 placehold 迁移', link: '/migrate/from-placehold' },
          ],
        },
      ],
    },
  },
  vite: {
    define: {
      __API_BASE__: JSON.stringify(API_BASE),
    },
    plugins: [rewriteDocExampleUrls()],
  },
});
