import { clampCell, fillColor, strokeForCell, wrapPattern } from '../helpers';
import type { PatternRenderer } from '../types';

/** 锯齿 / V 形纹 */
export const renderZigzag: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 10, 20);
  const half = unit / 2;

  return wrapPattern(
    unit,
    half,
    [
      `<rect width="${unit}" height="${half}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M0,${half} L${half},0 L${unit},${half} Z" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 砖墙（错位矩形） */
export const renderBricks: PatternRenderer = (ctx) => {
  const brickW = clampCell(ctx.cell * 2, 12, 24);
  const brickH = Math.max(6, Math.round(brickW * 0.45));
  const halfW = brickW / 2;
  const periodH = brickH * 2;
  const gap = Math.max(0.8, brickH * 0.08);
  const innerW = halfW - gap * 2;
  const innerH = brickH - gap * 2;

  return wrapPattern(
    brickW,
    periodH,
    [
      `<rect width="${brickW}" height="${periodH}" fill="${fillColor(ctx.c2)}"/>`,
      `<rect x="${gap}" y="${gap}" width="${innerW}" height="${innerH}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${halfW + gap}" y="${gap}" width="${innerW}" height="${innerH}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${halfW / 2 + gap}" y="${brickH + gap}" width="${innerW}" height="${innerH}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${halfW + halfW / 2 + gap}" y="${brickH + gap}" width="${innerW}" height="${innerH}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 三角拼贴（四象限风车，alternate 双色） */
export const renderTriangles: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 16);
  const half = unit / 2;
  const c1 = fillColor(ctx.c1);
  const c2 = fillColor(ctx.c2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${c2}"/>`,
      `<path d="M0,0 L${half},0 L0,${half} Z" fill="${c1}"/>`,
      `<path d="M${half},0 L${unit},0 L${half},${half} Z" fill="${c2}"/>`,
      `<path d="M${unit},${half} L${unit},${unit} L${half},${unit} Z" fill="${c1}"/>`,
      `<path d="M0,${half} L${half},${unit} L0,${unit} Z" fill="${c2}"/>`,
    ].join(''),
  );
};

/** 十字格 */
export const renderCross: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 16);
  const stroke = strokeForCell(unit, 0.18);
  const half = unit / 2;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<line x1="${half}" y1="0" x2="${half}" y2="${unit}" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<line x1="0" y1="${half}" x2="${unit}" y2="${half}" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
    ].join(''),
  );
};

/** 阶梯纹（互锁 L 形） */
export const renderSteps: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 24);
  const half = unit / 2;
  const step = unit / 4;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M0,0 H${half} V${step} H${step} V${half} H0 Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M${half},${half} H${unit} V${half + step} H${half + step} V${unit} H${half} Z" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};
