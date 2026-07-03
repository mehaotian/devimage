import { NATIVE_STYLE_CATALOG } from './native-catalog';
import { PARTNER_STYLE_CATALOG } from './partner-catalog';
import type { AvatarEngine, AvatarStyleMeta } from './types';

export type { AvatarEngine, AvatarStyleGroup, AvatarStyleMeta } from './types';

const ALL_STYLES: readonly AvatarStyleMeta[] = [
  ...NATIVE_STYLE_CATALOG,
  ...PARTNER_STYLE_CATALOG,
];

const STYLE_MAP = new Map(ALL_STYLES.map((item) => [item.id, item]));

/** DiceBear style id → JSON 定义路径 */
export const DICEBEAR_STYLE_FILES: Record<string, string> = {
  rings: 'rings',
  identicon: 'identicon',
  shapes: 'shapes',
  stripes: 'stripes',
  triangles: 'triangles',
  glass: 'glass',
  disco: 'disco',
  'shape-grid': 'shape-grid',
  thumbs: 'thumbs',
  'pixel-art': 'pixel-art',
  'pixel-art-neutral': 'pixel-art-neutral',
  lorelei: 'lorelei',
  'lorelei-neutral': 'lorelei-neutral',
  notionists: 'notionists',
  'notionists-neutral': 'notionists-neutral',
  'open-peeps': 'open-peeps',
  avataaars: 'avataaars',
  bottts: 'bottts',
  adventurer: 'adventurer',
  micah: 'micah',
  icons: 'icons',
  initials: 'initials',
  'initial-face': 'initial-face',
  croodles: 'croodles',
  'croodles-neutral': 'croodles-neutral',
  'fun-emoji': 'fun-emoji',
  glyphs: 'glyphs',
  miniavs: 'miniavs',
  'toon-head': 'toon-head',
  'bottts-neutral': 'bottts-neutral',
  'avataaars-neutral': 'avataaars-neutral',
  'adventurer-neutral': 'adventurer-neutral',
  personas: 'personas',
  'big-smile': 'big-smile',
  'big-ears': 'big-ears',
  'big-ears-neutral': 'big-ears-neutral',
  dylan: 'dylan',
};

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
 * 获取风格对应 provider
 */
export function getAvatarProvider(style: string): string | undefined {
  return STYLE_MAP.get(style)?.provider;
}

/**
 * 判断是否为 DiceBear partner 风格
 */
export function isDicebearStyle(style: string): boolean {
  return STYLE_MAP.get(style)?.provider === 'dicebear';
}

/**
 * @deprecated 使用 isDicebearStyle；保留兼容旧引用
 */
export function isPartnerStyle(style: string): boolean {
  return isDicebearStyle(style);
}

/**
 * 按 style id 加载 DiceBear JSON 定义
 */
export function loadDicebearStyleDefinition(styleId: string): Record<string, unknown> {
  const fileKey = DICEBEAR_STYLE_FILES[styleId];
  if (!fileKey) {
    throw new Error(`Unknown partner style: ${styleId}`);
  }

  return require(`@dicebear/styles/${fileKey}.json`) as Record<string, unknown>;
}
