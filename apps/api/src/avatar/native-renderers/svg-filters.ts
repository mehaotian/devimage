import { hslToHex } from '../../common/utils';
import { seedToInt, seedToUnit } from '../../common/seed';
import { buildGradientColors } from '../devimg-palette';

export type FilterMaterial = 'glass' | 'neon' | 'paper' | 'riso';

/** 毛玻璃背景色方案 */
export interface GlassScheme {
  readonly blobA: string;
  readonly blobB: string;
  readonly blobC: string;
  readonly blobD: string;
  readonly base: string;
}

/** 霓虹配色 */
export interface NeonScheme {
  readonly bgTop: string;
  readonly bgBottom: string;
  readonly tube: string;
  readonly tubeSecondary: string;
  readonly tubeCore: string;
}

/** 纸雕层色 */
export interface PaperScheme {
  readonly sky: string;
  readonly layers: readonly [string, string, string, string];
  readonly accent: string;
}

/** Risograph 三色油墨 */
export type RisoScheme = readonly [string, string, string];

/** 精选毛玻璃配色 */
const GLASS_SCHEMES: readonly GlassScheme[] = [
  { base: '#6366f1', blobA: '#ec4899', blobB: '#8b5cf6', blobC: '#06b6d4', blobD: '#f472b6' },
  { base: '#0ea5e9', blobA: '#22d3ee', blobB: '#3b82f6', blobC: '#a855f7', blobD: '#67e8f9' },
  { base: '#f97316', blobA: '#fb7185', blobB: '#fbbf24', blobC: '#f472b6', blobD: '#fdba74' },
  { base: '#10b981', blobA: '#34d399', blobB: '#14b8a6', blobC: '#06b6d4', blobD: '#6ee7b7' },
  { base: '#7c3aed', blobA: '#d946ef', blobB: '#6366f1', blobC: '#818cf8', blobD: '#c084fc' },
  { base: '#e11d48', blobA: '#fb923c', blobB: '#facc15', blobC: '#f472b6', blobD: '#fda4af' },
  { base: '#0891b2', blobA: '#2dd4bf', blobB: '#0284c7', blobC: '#38bdf8', blobD: '#5eead4' },
  { base: '#4f46e5', blobA: '#06b6d4', blobB: '#8b5cf6', blobC: '#ec4899', blobD: '#a5b4fc' },
  { base: '#ca8a04', blobA: '#ea580c', blobB: '#dc2626', blobC: '#fbbf24', blobD: '#fcd34d' },
  { base: '#059669', blobA: '#047857', blobB: '#10b981', blobC: '#34d399', blobD: '#bbf7d0' },
] as const;

/** 霓虹管经典色 */
const NEON_TUBES = [
  '#ff2d95', '#00e5ff', '#39ff14', '#ff6b00', '#bf5fff', '#ffea00',
  '#ff0080', '#00ffcc', '#7fff00', '#ff4500',
] as const;

/** Risograph 经典油墨 */
const RISO_INKS = [
  ['#ff4d8d', '#00b8a9', '#ffd166'],
  ['#0068ff', '#ff4757', '#ffc048'],
  ['#e040fb', '#00e676', '#ffab40'],
  ['#ff6b6b', '#4ecdc4', '#ffe66d'],
  ['#ff006e', '#8338ec', '#ffbe0b'],
  ['#3a86ff', '#fb5607', '#ff006e'],
  ['#06d6a0', '#118ab2', '#ef476f'],
  ['#7209b7', '#f72585', '#4cc9f0'],
] as const;

/**
 * 毛玻璃背景配色
 */
export function pickGlassScheme(seed: string): GlassScheme {
  return GLASS_SCHEMES[seedToInt(seed, 'glass-scheme', 0, GLASS_SCHEMES.length)]!;
}

/**
 * 霓虹配色（主色 + 辅色）
 */
export function pickNeonScheme(seed: string): NeonScheme {
  const tubeIdx = seedToInt(seed, 'neon-tube', 0, NEON_TUBES.length);
  let secIdx = seedToInt(seed, 'neon-tube-2', 0, NEON_TUBES.length);
  if (secIdx === tubeIdx) {
    secIdx = (secIdx + 3) % NEON_TUBES.length;
  }
  const hue = seedToInt(seed, 'neon-bg-h', 200, 320);
  return {
    bgTop: `#${hslToHex(hue, 42 + seedToInt(seed, 'neon-bg-s', 0, 20), 10 + seedToInt(seed, 'neon-bg-l', 0, 8))}`,
    bgBottom: `#${hslToHex((hue + 15 + seedToInt(seed, 'neon-bg-d', 0, 30)) % 360, 48, 4 + seedToInt(seed, 'neon-bg-dl', 0, 6))}`,
    tube: NEON_TUBES[tubeIdx]!,
    tubeSecondary: NEON_TUBES[secIdx]!,
    tubeCore: '#ffffff',
  };
}

/**
 * 纸雕层配色
 */
export function pickPaperScheme(seed: string): PaperScheme {
  const mood = seedToInt(seed, 'paper-mood', 0, 4);
  const baseHue = seedToInt(seed, 'paper-h', 160, 280);
  const skies = [
    `#${hslToHex((baseHue + 40) % 360, 35, 94)}`,
    `#${hslToHex((baseHue + 25) % 360, 45, 88)}`,
    `#${hslToHex((baseHue + 55) % 360, 30, 78)}`,
    `#${hslToHex((baseHue + 10) % 360, 25, 22)}`,
    `#${hslToHex((baseHue + 35) % 360, 50, 82)}`,
  ];
  return {
    sky: skies[mood] ?? skies[0],
    layers: [
      `#${hslToHex(baseHue, 42, 82 - mood * 8)}`,
      `#${hslToHex((baseHue + 15) % 360, 48, 68 - mood * 6)}`,
      `#${hslToHex((baseHue + 30) % 360, 52, 52 - mood * 5)}`,
      `#${hslToHex((baseHue + 8) % 360, 55, 38 - mood * 4)}`,
    ],
    accent: mood === 3 ? `#${hslToHex((baseHue + 50) % 360, 60, 75)}` : '#ffd166',
  };
}

/**
 * Risograph 三色油墨
 */
export function pickRisoScheme(seed: string): RisoScheme {
  return RISO_INKS[seedToInt(seed, 'riso-palette', 0, RISO_INKS.length)]! as RisoScheme;
}

/**
 * 由 seed 推导 Riso 纸张底色
 */
export function pickRisoPaper(seed: string): string {
  const warm = seedToInt(seed, 'riso-paper', 0, 100) > 50;
  return warm ? '#faf6ef' : `#${hslToHex(seedToInt(seed, 'riso-paper-h', 30, 50), 18, 95)}`;
}

/**
 * 背景模糊（模拟毛玻璃后景）
 */
export function buildHeavyBlurFilter(id: string, stdDeviation = 7): string {
  return [
    `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">`,
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${stdDeviation}"/>`,
    `</filter>`,
  ].join('');
}

/**
 * 玻璃卡片投影
 */
export function buildGlassShadowFilter(id: string): string {
  return [
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">`,
    `<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>`,
    `</filter>`,
  ].join('');
}

/**
 * 霓虹多层辉光
 */
export function buildNeonOuterGlowFilter(id: string, color: string, blur = 5.5): string {
  return [
    `<filter id="${id}" x="-80%" y="-80%" width="260%" height="260%" color-interpolation-filters="sRGB">`,
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/>`,
    `<feFlood flood-color="${color}" flood-opacity="0.55" result="c"/>`,
    `<feComposite in="c" in2="b" operator="in" result="g"/>`,
    `<feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>`,
    `</filter>`,
  ].join('');
}

/**
 * 霓虹核心高亮
 */
export function buildNeonCoreGlowFilter(id: string, color: string): string {
  return [
    `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%">`,
    `<feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b"/>`,
    `<feFlood flood-color="${color}" flood-opacity="0.95" result="c"/>`,
    `<feComposite in="c" in2="b" operator="in" result="g"/>`,
    `<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>`,
    `</filter>`,
  ].join('');
}

/**
 * 纸雕层阴影
 */
export function buildPaperShadowFilter(id: string, dx: number, dy: number): string {
  return [
    `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%">`,
    `<feDropShadow dx="${dx.toFixed(1)}" dy="${dy.toFixed(1)}" stdDeviation="2" flood-color="#3d3028" flood-opacity="0.22"/>`,
    `</filter>`,
  ].join('');
}

/**
 * Risograph 纸张颗粒
 */
export function buildRisoGrainFilter(id: string, turbulenceSeed: number): string {
  return [
    `<filter id="${id}">`,
    `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="${turbulenceSeed}" result="n"/>`,
    `<feColorMatrix in="n" type="saturate" values="0" result="g"/>`,
    `<feBlend in="SourceGraphic" in2="g" mode="multiply"/>`,
    `</filter>`,
  ].join('');
}

/**
 * @deprecated 保留兼容
 */
export function buildFilterPalette(seed: string): {
  c1: string;
  c2: string;
  c3: string;
  dark: string;
  light: string;
} {
  const { c1, c2, c3 } = buildGradientColors(seed);
  return { c1: `#${c1}`, c2: `#${c2}`, c3: `#${c3}`, dark: `#${c2}`, light: `#${c3}` };
}

/**
 * seed 推导 [min,max] 范围内浮点
 */
export function seedRange(seed: string, slot: string, min: number, max: number): number {
  return min + seedToUnit(seed, slot) * (max - min);
}
