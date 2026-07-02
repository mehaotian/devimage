import { clampCell, fillColor, strokeForCell, wrapPattern } from '../helpers';
import type { PatternRenderer } from '../types';

/** 千鸟格（简化） */
export const renderHoundstooth: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 10, 24);
  const half = unit / 2;
  const quarter = unit / 4;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M0,0 H${half} V${quarter} H${quarter} V${half} H0 Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M${half},${half} H${unit} V${half + quarter} H${half + quarter} V${unit} H${half} Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M${half},0 H${half + quarter} V${quarter} H${unit} V0 Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M0,${half} H${quarter} V${half + quarter} H${half} V${unit} H0 Z" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 菱形格（argyle） */
export const renderArgyle: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 28);
  const half = unit / 2;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M${half},0 L${unit},${half} L${half},${unit} L0,${half} Z" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 编织篮纹 */
export const renderWeave: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 16);
  const half = unit / 2;
  const stripW = Math.max(2, unit * 0.22);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<rect x="0" y="0" width="${unit}" height="${stripW}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="0" y="${half}" width="${stripW}" height="${half}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${half}" y="${half}" width="${half}" height="${stripW}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${unit - stripW}" y="0" width="${stripW}" height="${half}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 桌布格（细棋盘） */
export const renderTablecloth: PatternRenderer = (ctx) => {
  const tile = clampCell(ctx.cell, 4, 8);
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

/** 碳纤维（双层细斜线） */
export const renderCarbon: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 6, 12);
  const stroke = Math.max(0.8, unit * 0.12).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M0,${unit} L${unit},0" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<path d="M-${unit},${unit} L${unit},-${unit}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}" opacity="0.55"/>`,
    ].join(''),
    'rotate(45)',
  );
};

/** 七宝纹（重叠四分圆） */
export const renderShippo: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 24);
  const half = unit / 2;
  const r = half.toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${strokeForCell(unit)}"/>`,
      `<circle cx="${unit}" cy="0" r="${r}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${strokeForCell(unit)}"/>`,
      `<circle cx="0" cy="${unit}" r="${r}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${strokeForCell(unit)}"/>`,
      `<circle cx="${unit}" cy="${unit}" r="${r}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${strokeForCell(unit)}"/>`,
    ].join(''),
  );
};
