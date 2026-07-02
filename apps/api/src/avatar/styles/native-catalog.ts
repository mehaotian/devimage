import type { AvatarStyleMeta } from './types';

/**
 * DevImage 自研 native 头像风格目录
 */
export const NATIVE_STYLE_CATALOG: readonly AvatarStyleMeta[] = [
  {
    id: 'devimg-gradient',
    title: '渐变圆',
    group: 'gradient',
    engine: 'native',
    license: 'DevImage',
    provider: 'devimage',
  },
  {
    id: 'devimg-mesh',
    title: '网格渐变',
    group: 'gradient',
    engine: 'native',
    license: 'DevImage',
    provider: 'devimage',
  },
  {
    id: 'devimg-geo',
    title: '几何弧环',
    group: 'geometric',
    engine: 'native',
    license: 'DevImage',
    provider: 'devimage',
  },
  {
    id: 'devimg-initials',
    title: '渐变首字',
    group: 'text',
    engine: 'native',
    license: 'DevImage',
    provider: 'devimage',
  },
] as const;
