import { buildGradientColors } from '../devimg-palette';
import { seedToInt } from '../../common/seed';
import { DEVIMG_PATTERN_IDS, getPatternRenderer } from './catalog';
import type { DevimgPatternId, PatternRenderContext, PatternRenderResult } from './types';

export type { DevimgPatternId, PatternGroupMeta, PatternRenderContext, PatternRenderResult } from './types';
export { PATTERN_GROUPS, DEVIMG_PATTERN_IDS, listDevimgPatternIds, buildPatternCatalog, PATTERN_TITLES } from './catalog';

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
  const { c1, c2, c3, angle } = buildGradientColors(seed);
  const cell = seedToInt(seed, 'pat-cell', 6, 15);
  let patternId: DevimgPatternId;

  if (patternOverride && isDevimgPatternId(patternOverride)) {
    patternId = patternOverride;
  } else {
    patternId = DEVIMG_PATTERN_IDS[seedToInt(seed, 'pat-id', 0, DEVIMG_PATTERN_IDS.length)]!;
  }

  return { c1, c2, c3, cell, angle, patternId };
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
  const rendered = getPatternRenderer(patternId)(renderCtx);

  return { ...rendered, patternId };
}
