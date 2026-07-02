import { clampCell, fillColor, strokeForCell, stripeTile, wrapPattern } from '../helpers';
import type { PatternRenderer } from '../types';

/** 斜向条纹 */
export const renderStripes: PatternRenderer = (ctx) => {
  const stripe = clampCell(ctx.cell, 4);
  return stripeTile(ctx, stripe, ctx.angle);
};

/** 竖条纹（宽条 + 间隙，区别于 horizontal / diagonal stripes） */
export const renderVerticalStripes: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 6, 12);
  const bar = unit * 0.55;
  const c1 = fillColor(ctx.c1);
  const c2 = fillColor(ctx.c2);

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${c2}"/>`, `<rect width="${bar}" height="${unit}" fill="${c1}"/>`].join(''),
  );
};

/** 横条纹（宽条 + 间隙） */
export const renderHorizontalStripes: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 6, 12);
  const bar = unit * 0.55;
  const c1 = fillColor(ctx.c1);
  const c2 = fillColor(ctx.c2);

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${c2}"/>`, `<rect width="${unit}" height="${bar}" fill="${c1}"/>`].join(''),
  );
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
  const stroke = Math.max(1, unit * 0.12).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M ${unit} 0 L 0 0 0 ${unit}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
    ].join(''),
  );
};

/** 横线纸（红线边距 + 双横线，区别于 horizontal-stripes） */
export const renderLinedPaper: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 16);
  const rule = strokeForCell(unit, 0.08);
  const margin = strokeForCell(unit, 0.05);
  const c1 = fillColor(ctx.c1);
  const c3 = fillColor(ctx.c3);
  const ruleY1 = (unit * 0.55).toFixed(2);
  const ruleY2 = (unit * 0.78).toFixed(2);
  const marginX = (unit * 0.18).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<line x1="${marginX}" y1="0" x2="${marginX}" y2="${unit}" stroke="${c3}" stroke-width="${margin}" opacity="0.85"/>`,
      `<line x1="0" y1="${ruleY1}" x2="${unit}" y2="${ruleY1}" stroke="${c1}" stroke-width="${rule}"/>`,
      `<line x1="0" y1="${ruleY2}" x2="${unit}" y2="${ruleY2}" stroke="${c1}" stroke-width="${rule}" opacity="0.55"/>`,
    ].join(''),
  );
};
