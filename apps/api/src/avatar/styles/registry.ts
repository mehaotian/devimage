import { NATIVE_STYLE_CATALOG } from './native-catalog';
import { PARTNER_STYLE_CATALOG } from './partner-catalog';
import type { AvatarEngine, AvatarStyleMeta } from './types';

export type { AvatarEngine, AvatarStyleGroup, AvatarStyleMeta } from './types';

const ALL_STYLES: readonly AvatarStyleMeta[] = [
  ...NATIVE_STYLE_CATALOG,
  ...PARTNER_STYLE_CATALOG,
];

const STYLE_MAP = new Map(ALL_STYLES.map((item) => [item.id, item]));

/**
 * 判断 style 是否在统一注册表中
 */
export function isKnownAvatarStyle(style: string): boolean {
  return STYLE_MAP.has(style);
}

/**
 * 获取风格元数据
 */
export function getAvatarStyleMeta(style: string): AvatarStyleMeta | undefined {
  return STYLE_MAP.get(style);
}

/**
 * 返回全部风格元数据（native 在前）
 */
export function listAvatarStyles(): AvatarStyleMeta[] {
  return ALL_STYLES.map((item) => ({ ...item }));
}

/**
 * 获取风格对应引擎
 */
export function getAvatarEngine(style: string): AvatarEngine | undefined {
  return STYLE_MAP.get(style)?.engine;
}

/**
 * 判断是否为 DiceBear partner 风格
 */
export function isPartnerStyle(style: string): boolean {
  return STYLE_MAP.get(style)?.engine === 'partner';
}

/**
 * 按 style id 加载 DiceBear JSON 定义
 */
export function loadDicebearStyleDefinition(styleId: string): Record<string, unknown> {
  if (!isPartnerStyle(styleId)) {
    throw new Error(`Not a partner style: ${styleId}`);
  }

  switch (styleId) {
    case 'rings':
      return require('@dicebear/styles/rings.json') as Record<string, unknown>;
    case 'identicon':
      return require('@dicebear/styles/identicon.json') as Record<string, unknown>;
    case 'shapes':
      return require('@dicebear/styles/shapes.json') as Record<string, unknown>;
    case 'stripes':
      return require('@dicebear/styles/stripes.json') as Record<string, unknown>;
    case 'triangles':
      return require('@dicebear/styles/triangles.json') as Record<string, unknown>;
    case 'glass':
      return require('@dicebear/styles/glass.json') as Record<string, unknown>;
    case 'disco':
      return require('@dicebear/styles/disco.json') as Record<string, unknown>;
    case 'shape-grid':
      return require('@dicebear/styles/shape-grid.json') as Record<string, unknown>;
    case 'thumbs':
      return require('@dicebear/styles/thumbs.json') as Record<string, unknown>;
    case 'pixel-art':
      return require('@dicebear/styles/pixel-art.json') as Record<string, unknown>;
    case 'pixel-art-neutral':
      return require('@dicebear/styles/pixel-art-neutral.json') as Record<string, unknown>;
    case 'lorelei':
      return require('@dicebear/styles/lorelei.json') as Record<string, unknown>;
    case 'lorelei-neutral':
      return require('@dicebear/styles/lorelei-neutral.json') as Record<string, unknown>;
    case 'notionists':
      return require('@dicebear/styles/notionists.json') as Record<string, unknown>;
    case 'notionists-neutral':
      return require('@dicebear/styles/notionists-neutral.json') as Record<string, unknown>;
    case 'open-peeps':
      return require('@dicebear/styles/open-peeps.json') as Record<string, unknown>;
    case 'avataaars':
      return require('@dicebear/styles/avataaars.json') as Record<string, unknown>;
    case 'bottts':
      return require('@dicebear/styles/bottts.json') as Record<string, unknown>;
    case 'adventurer':
      return require('@dicebear/styles/adventurer.json') as Record<string, unknown>;
    case 'micah':
      return require('@dicebear/styles/micah.json') as Record<string, unknown>;
    case 'icons':
      return require('@dicebear/styles/icons.json') as Record<string, unknown>;
    default:
      throw new Error(`Unknown partner style: ${styleId}`);
  }
}
