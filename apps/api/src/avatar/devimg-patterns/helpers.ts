import type { PatternRenderResult } from './types';

/**
 * 拼接 6 位 hex 为 SVG fill/stroke 色值
 */
export function fillColor(hex: string): string {
  return `#${hex}`;
}

/**
 * 将 cell 限制在 [min, max] 范围
 */
export function clampCell(cell: number, min: number, max = min + 12): number {
  return Math.max(min, Math.min(max, cell));
}

/**
 * 按单元格大小推导描边宽度
 */
export function strokeForCell(cell: number, ratio = 0.08): string {
  return Math.max(0.5, cell * ratio).toFixed(2);
}

/**
 * 包装 SVG pattern 瓦片为完整背景层
 */
export function wrapPattern(
  tileW: number,
  tileH: number,
  inner: string,
  transform?: string,
): PatternRenderResult {
  const transformAttr = transform ? ` patternTransform="${transform}"` : '';

  return {
    defs: [
      `<defs>`,
      `<pattern id="pat" width="${tileW}" height="${tileH}" patternUnits="userSpaceOnUse"${transformAttr}>`,
      inner,
      `</pattern>`,
      `</defs>`,
    ].join(''),
    body: `<rect width="100" height="100" fill="url(#pat)"/>`,
  };
}

/**
 * 渲染双色交替条纹瓦片（供 stripes 系列复用）
 */
export function stripeTile(
  ctx: { c1: string; c2: string },
  stripe: number,
  angle: number,
): PatternRenderResult {
  const half = stripe / 2;

  return wrapPattern(
    stripe,
    stripe,
    [
      `<rect width="${half}" height="${stripe}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${half}" width="${half}" height="${stripe}" fill="${fillColor(ctx.c2)}"/>`,
    ].join(''),
    `rotate(${angle})`,
  );
}
