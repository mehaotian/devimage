import { defineConfig } from 'vitepress';

const API_BASE = process.env.VITE_API_BASE ?? 'http://localhost:3000';

export default defineConfig({
  title: 'devimg',
  description: '图即 — 开发用的占位图 CDN。占位图、头像、场景图、Mock 数据，URL 即用。',
  lang: 'zh-CN',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png', type: 'image/png' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
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
            { text: '部署', link: '/guide/deployment' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '占位图', link: '/api/placeholder' },
            { text: '头像', link: '/api/avatar' },
            { text: '场景图', link: '/api/scene' },
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
    footer: {
      message: 'devimg · 图即 — 开发用的占位图 CDN',
      copyright: 'Copyright © 2026 devimg',
    },
  },
  vite: {
    define: {
      __API_BASE__: JSON.stringify(API_BASE),
    },
  },
});
