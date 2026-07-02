import { clampCell, fillColor, strokeForCell, stripeTile, wrapPattern } from '../helpers';
import type { PatternRenderer } from '../types';

/** 斜向条纹 */
export const renderStripes: PatternRenderer = (ctx) => {
  const stripe = clampCell(ctx.cell, 4);
  return stripeTile(ctx, stripe, ctx.angle);
};

/** 竖条纹 */
export const renderVerticalStripes: PatternRenderer = (ctx) => {
  const stripe = clampCell(ctx.cell, 4);
  return stripeTile(ctx, stripe, 0);
};

/** 横条纹 */
export const renderHorizontalStripes: PatternRenderer = (ctx) => {
  const stripe = clampCell(ctx.cell, 4);
  return stripeTile(ctx, stripe, 90);
};

/** 波点 */
export const renderPolka: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8);
  const radius = (unit * 0.38).toFixed(2);
  const center = (unit / 2).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="${center}" cy="${center}" r="${radius}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 棋盘格 */
export const renderChecker: PatternRenderer = (ctx) => {
  const tile = clampCell(ctx.cell, 5);
  const period = tile * 2;

  return wrapPattern(
    period,
    period,
    [
      `<rect width="${period}" height="${period}" fill="${fillColor(ctx.c2)}"/>`,
      `<rect width="${tile}" height="${tile}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${tile}" y="${tile}" width="${tile}" height="${tile}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 斜棋盘 */
export const renderDiagonalChecker: PatternRenderer = (ctx) => {
  const tile = clampCell(ctx.cell, 5);
  const period = tile * 2;

  return wrapPattern(
    period,
    period,
    [
      `<rect width="${period}" height="${period}" fill="${fillColor(ctx.c2)}"/>`,
      `<rect width="${tile}" height="${tile}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${tile}" y="${tile}" width="${tile}" height="${tile}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
    'rotate(45)',
  );
};

/** 网格线 */
export const renderGrid: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8);
  const stroke = Math.max(0.6, unit * 0.08).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M ${unit} 0 L 0 0 0 ${unit}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
    ].join(''),
  );
};

/** 横线纸 */
export const renderLinedPaper: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 6, 14);
  const stroke = strokeForCell(unit, 0.06);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<line x1="0" y1="${unit - 1}" x2="${unit}" y2="${unit - 1}" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
    ].join(''),
  );
};
