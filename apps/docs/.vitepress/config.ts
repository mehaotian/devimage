import { defineConfig } from 'vitepress';

const API_BASE = process.env.VITE_API_BASE ?? 'http://localhost:3000';

export default defineConfig({
  title: 'DevImage',
  description: '国内开发者占位资源 CDN — 图片、头像、Mock 数据',
  lang: 'zh-CN',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: 'API', link: '/api/placeholder' },
      { text: '迁移', link: '/migrate/from-picsum' },
      { text: '开发文档', link: '/guide/dev-spec' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '功能与分期规划', link: '/guide/dev-spec' },
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/devimage/devimage' }],
    footer: {
      message: 'Released under MIT License.',
      copyright: 'Copyright © 2026 DevImage',
    },
  },
  vite: {
    define: {
      __API_BASE__: JSON.stringify(API_BASE),
    },
  },
});
