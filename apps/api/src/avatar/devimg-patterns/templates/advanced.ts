import { clampCell, fillColor, strokeForCell, wrapPattern } from '../helpers';
import { hexagonPath, isometricCubePaths } from './geometry-helpers';
import type { PatternRenderer } from '../types';

/** 半菱形拼贴 */
export const renderHalfRombes: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 22);
  const half = unit / 2;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M0,0 L${half},${half} L0,${unit} Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M${unit},0 L${half},${half} L${unit},${unit} Z" fill="${fillColor(ctx.c1)}" opacity="0.82"/>`,
    ].join(''),
  );
};

/** 摩洛哥星形（marrakesh 简化） */
export const renderMarrakesh: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const cx = unit / 2;
  const cy = unit / 2;
  const r = unit * 0.38;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M ${cx},${cy - r} L ${cx + r * 0.25},${cy - r * 0.25} L ${cx + r},${cy} L ${cx + r * 0.25},${cy + r * 0.25} L ${cx},${cy + r} L ${cx - r * 0.25},${cy + r * 0.25} L ${cx - r},${cy} L ${cx - r * 0.25},${cy - r * 0.25} Z" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 原子网格（点 + 十字） */
export const renderAtomic: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 14);
  const stroke = strokeForCell(unit, 0.1);
  const half = unit / 2;
  const dotR = Math.max(0.8, unit * 0.08).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<line x1="${half}" y1="0" x2="${half}" y2="${unit}" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<line x1="0" y1="${half}" x2="${unit}" y2="${half}" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<circle cx="${half}" cy="${half}" r="${dotR}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 蝉翼纹（不等宽条纹） */
export const renderCicada: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 20);
  const w1 = unit * 0.12;
  const w2 = unit * 0.22;
  const w3 = unit * 0.08;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<rect x="0" y="0" width="${w1}" height="${unit}" fill="${fillColor(ctx.c1)}"/>`,
      `<rect x="${w1 + w3}" y="0" width="${w2}" height="${unit}" fill="${fillColor(ctx.c1)}" opacity="0.9"/>`,
      `<rect x="${w1 + w3 + w2 + w3}" y="0" width="${w1}" height="${unit}" fill="${fillColor(ctx.c1)}" opacity="0.75"/>`,
    ].join(''),
    'rotate(45)',
  );
};

/** 金字塔（三角明暗错觉） */
export const renderPyramid: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 22);
  const half = unit / 2;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M ${half},0 L ${unit},${half} L ${half},${unit} Z" fill="${fillColor(ctx.c1)}"/>`,
      `<path d="M ${half},0 L 0,${half} L ${half},${unit} Z" fill="${fillColor(ctx.c1)}" opacity="0.55"/>`,
    ].join(''),
  );
};

/** 箭头 repeat */
export const renderArrows: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 20);
  const h = unit / 2;
  const arrow = [
    `M 0,${h}`,
    `L ${h * 0.6},${h * 0.25}`,
    `L ${h * 0.6},${h * 0.45}`,
    `L ${unit},${h * 0.45}`,
    `L ${unit},${h * 1.55}`,
    `L ${h * 0.6},${h * 1.55}`,
    `L ${h * 0.6},${h * 1.75}`,
    `Z`,
  ].join(' ');

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`, `<path d="${arrow}" fill="${fillColor(ctx.c1)}"/>`].join(''),
  );
};

/** 蜂窝六边形 */
export const renderHoneycomb: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 26);
  const r = unit * 0.32;
  const cx = unit / 2;
  const cy = unit / 2;
  const stroke = strokeForCell(unit, 0.05);
  const hex = hexagonPath(cx, cy, r);
  const hexFill = hexagonPath(cx, cy, r * 0.92);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="${hex}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<path d="${hexFill}" fill="${fillColor(ctx.c1)}" opacity="0.35"/>`,
    ].join(''),
  );
};

/** 日式立体方块（isometric cube） */
export const renderJapaneseCube: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 16, 28);
  const size = unit * 0.55;
  const cube = isometricCubePaths(unit * 0.12, unit * 0.08, size, {
    top: fillColor(ctx.c1),
    left: fillColor(ctx.c2),
    right: fillColor(ctx.c1),
  });

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`, cube].join(''),
  );
};
