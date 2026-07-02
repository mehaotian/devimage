import { buildGradientColors } from './devimg-palette';
import { seedToInt } from '../common/seed';

/** CSS 纹理 pattern 标识 */
export type DevimgPatternId =
  | 'stripes'
  | 'polka'
  | 'checker'
  | 'houndstooth'
  | 'argyle'
  | 'grid';

/** pattern 渲染上下文（viewBox 100×100） */
export interface PatternRenderContext {
  readonly c1: string;
  readonly c2: string;
  readonly cell: number;
  readonly angle: number;
}

/** pattern 渲染结果 */
export interface PatternRenderResult {
  readonly defs: string;
  readonly body: string;
}

/** 全部 pattern id（顺序与 seed 槽位一致） */
export const DEVIMG_PATTERN_IDS: readonly DevimgPatternId[] = [
  'stripes',
  'polka',
  'checker',
  'houndstooth',
  'argyle',
  'grid',
] as const;

const PATTERN_RENDERERS: Record<
  DevimgPatternId,
  (ctx: PatternRenderContext) => PatternRenderResult
> = {
  stripes: renderStripes,
  polka: renderPolka,
  checker: renderChecker,
  houndstooth: renderHoundstooth,
  argyle: renderArgyle,
  grid: renderGrid,
};

/**
 * 判断 pattern id 是否合法
 */
export function isDevimgPatternId(value: string): value is DevimgPatternId {
  return (DEVIMG_PATTERN_IDS as readonly string[]).includes(value);
}

/**
 * 由 seed 推导 pattern 渲染上下文与 pattern 类型
 */
export function buildPatternContext(
  seed: string,
  patternOverride?: string,
): PatternRenderContext & { patternId: DevimgPatternId } {
  const { c1, c2, angle } = buildGradientColors(seed);
  const cell = seedToInt(seed, 'pat-cell', 6, 15);
  let patternId: DevimgPatternId;

  if (patternOverride && isDevimgPatternId(patternOverride)) {
    patternId = patternOverride;
  } else {
    patternId = DEVIMG_PATTERN_IDS[seedToInt(seed, 'pat-id', 0, DEVIMG_PATTERN_IDS.length)]!;
  }

  return { c1, c2, cell, angle, patternId };
}

/**
 * 渲染 seed 对应的 CSS 纹理 pattern 层
 */
export function renderDevimgPattern(
  seed: string,
  patternOverride?: string,
): PatternRenderResult & { patternId: DevimgPatternId } {
  const ctx = buildPatternContext(seed, patternOverride);
  const { patternId, ...renderCtx } = ctx;
  const rendered = PATTERN_RENDERERS[patternId](renderCtx);

  return { ...rendered, patternId };
}

/**
 * 斜向条纹（CSS3 Patterns · stripes 思路）
 */
function renderStripes(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell, angle } = ctx;
  const stripe = Math.max(4, cell);
  const half = stripe / 2;

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${stripe}" height="${stripe}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">`,
      `<rect width="${half}" height="${stripe}" fill="#${c1}"/>`,
      `<rect x="${half}" width="${half}" height="${stripe}" fill="#${c2}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 波点（polka dot）
 */
function renderPolka(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell } = ctx;
  const unit = Math.max(8, cell);
  const radius = (unit * 0.38).toFixed(2);
  const center = (unit / 2).toFixed(2);

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">`,
      `<rect width="${unit}" height="${unit}" fill="#${c2}"/>`,
      `<circle cx="${center}" cy="${center}" r="${radius}" fill="#${c1}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 棋盘格（checkerboard）
 */
function renderChecker(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell } = ctx;
  const tile = Math.max(5, cell);
  const period = tile * 2;

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${period}" height="${period}" patternUnits="userSpaceOnUse">`,
      `<rect width="${period}" height="${period}" fill="#${c2}"/>`,
      `<rect width="${tile}" height="${tile}" fill="#${c1}"/>`,
      `<rect x="${tile}" y="${tile}" width="${tile}" height="${tile}" fill="#${c1}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 千鸟格（houndstooth 简化版）
 */
function renderHoundstooth(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell } = ctx;
  const unit = Math.max(10, cell * 2);
  const half = unit / 2;
  const quarter = unit / 4;

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">`,
      `<rect width="${unit}" height="${unit}" fill="#${c2}"/>`,
      `<path d="M0,0 H${half} V${quarter} H${quarter} V${half} H0 Z" fill="#${c1}"/>`,
      `<path d="M${half},${half} H${unit} V${half + quarter} H${half + quarter} V${unit} H${half} Z" fill="#${c1}"/>`,
      `<path d="M${half},0 H${half + quarter} V${quarter} H${unit} V0 Z" fill="#${c1}"/>`,
      `<path d="M0,${half} H${quarter} V${half + quarter} H${half} V${unit} H0 Z" fill="#${c1}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 菱形格（argyle）
 */
function renderArgyle(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell } = ctx;
  const unit = Math.max(12, cell * 2);
  const half = unit / 2;

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">`,
      `<rect width="${unit}" height="${unit}" fill="#${c2}"/>`,
      `<path d="M${half},0 L${unit},${half} L${half},${unit} L0,${half} Z" fill="#${c1}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 网格线（blueprint grid）
 */
function renderGrid(ctx: PatternRenderContext): PatternRenderResult {
  const { c1, c2, cell } = ctx;
  const unit = Math.max(8, cell);
  const stroke = Math.max(0.6, unit * 0.08).toFixed(2);

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">`,
      `<rect width="${unit}" height="${unit}" fill="#${c2}"/>`,
      `<path d="M ${unit} 0 L 0 0 0 ${unit}" fill="none" stroke="#${c1}" stroke-width="${stroke}"/>`,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}
