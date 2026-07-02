import { hslToHex } from '../../../common/utils';
import { seedToInt } from '../../../common/seed';
import { clampCell, fillColor, wrapPattern } from '../helpers';
import type { PatternRenderer } from '../types';

/** 四色精品模板上下文 */
interface PremiumCtx {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  cell: number;
}

/**
 * 苏格兰格纹（tartan 简化）
 */
export const renderTartan: PatternRenderer = (ctx) => {
  const p = toPremium(ctx);
  const unit = clampCell(p.cell * 2, 14, 24);
  const band = Math.max(2, unit * 0.14);
  const c1 = fillColor(p.c1);
  const c2 = fillColor(p.c2);
  const c3 = fillColor(p.c3);
  const c4 = fillColor(p.c4);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${c2}"/>`,
      `<rect x="0" y="0" width="${unit}" height="${band}" fill="${c3}"/>`,
      `<rect x="0" y="${unit / 2 - band / 2}" width="${unit}" height="${band}" fill="${c1}"/>`,
      `<rect x="0" y="0" width="${band}" height="${unit}" fill="${c3}"/>`,
      `<rect x="${unit / 2 - band / 2}" y="0" width="${band}" height="${unit}" fill="${c1}"/>`,
      `<rect x="${unit / 2 - band}" y="${unit / 2 - band}" width="${band * 2}" height="${band * 2}" fill="${c4}"/>`,
    ].join(''),
  );
};

/**
 * 马德拉斯 plaid（多向色带）
 */
export const renderMadras: PatternRenderer = (ctx) => {
  const p = toPremium(ctx);
  const unit = clampCell(p.cell * 2, 16, 28);
  const c1 = fillColor(p.c1);
  const c2 = fillColor(p.c2);
  const c3 = fillColor(p.c3);
  const c4 = fillColor(p.c4);
  const s1 = Math.max(3, unit * 0.16);
  const s2 = Math.max(2, unit * 0.08);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${c2}"/>`,
      `<rect x="0" y="0" width="${unit}" height="${s1}" fill="${c1}"/>`,
      `<rect x="0" y="${s1 + s2}" width="${unit}" height="${s2}" fill="${c3}"/>`,
      `<rect x="0" y="0" width="${s1}" height="${unit}" fill="${c4}" opacity="0.85"/>`,
      `<rect x="${s1 + s2}" y="0" width="${s2}" height="${unit}" fill="${c1}" opacity="0.7"/>`,
    ].join(''),
    'rotate(45)',
  );
};

/**
 * 四色 gingham（细格 + 嵌线）
 */
export const renderGingham: PatternRenderer = (ctx) => {
  const p = toPremium(ctx);
  const tile = clampCell(p.cell, 5, 9);
  const period = tile * 2;
  const line = Math.max(0.8, tile * 0.12);
  const c1 = fillColor(p.c1);
  const c2 = fillColor(p.c2);
  const c3 = fillColor(p.c3);
  const c4 = fillColor(p.c4);

  return wrapPattern(
    period,
    period,
    [
      `<rect width="${period}" height="${period}" fill="${c2}"/>`,
      `<rect width="${tile}" height="${tile}" fill="${c1}"/>`,
      `<rect x="${tile}" y="${tile}" width="${tile}" height="${tile}" fill="${c1}"/>`,
      `<rect x="${tile - line / 2}" y="0" width="${line}" height="${period}" fill="${c3}"/>`,
      `<rect x="0" y="${tile - line / 2}" width="${period}" height="${line}" fill="${c4}"/>`,
    ].join(''),
  );
};

/**
 * 十字 plaid（四色交叠带）
 */
export const renderPlaid: PatternRenderer = (ctx) => {
  const p = toPremium(ctx);
  const unit = clampCell(p.cell * 2, 14, 26);
  const w = Math.max(2.5, unit * 0.12);
  const c1 = fillColor(p.c1);
  const c2 = fillColor(p.c2);
  const c3 = fillColor(p.c3);
  const c4 = fillColor(p.c4);
  const mid = unit / 2;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${c2}"/>`,
      `<rect x="0" y="${mid - w / 2}" width="${unit}" height="${w}" fill="${c1}"/>`,
      `<rect x="${mid - w / 2}" y="0" width="${w}" height="${unit}" fill="${c3}"/>`,
      `<rect x="${mid - w}" y="${mid - w}" width="${w * 2}" height="${w * 2}" fill="${c4}"/>`,
    ].join(''),
  );
};

/**
 * 提取四色精品上下文（c4 由 seed 推导）
 */
function toPremium(ctx: { c1: string; c2: string; c3: string; c4: string; cell: number }): PremiumCtx {
  return ctx;
}

/**
 * 由 seed 推导第四色（精品模板专用）
 */
export function buildPatternFourthColor(seed: string, baseHue?: number): string {
  const hBase = baseHue ?? seedToInt(seed, 'h1', 0, 360);
  const h4 = (hBase + seedToInt(seed, 'pat-h4', 90, 270)) % 360;
  return hslToHex(h4, 72, 48);
}
