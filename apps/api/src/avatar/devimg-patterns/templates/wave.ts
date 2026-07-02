import { clampCell, fillColor, strokeForCell, wrapPattern } from '../helpers';
import { seigaihaArc, waveSegment } from './geometry-helpers';
import type { PatternRenderer } from '../types';

/** 错位波点（hex 蜂窝感） */
export const renderDotsOffset: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell, 8, 14);
  const r = (unit * 0.32).toFixed(2);
  const cy1 = (unit / 2).toFixed(2);
  const cy2 = (unit * 1.5).toFixed(2);
  const cx1 = (unit / 2).toFixed(2);
  const cx2 = unit.toFixed(2);

  return wrapPattern(
    unit,
    unit * 2,
    [
      `<rect width="${unit}" height="${unit * 2}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="${cx1}" cy="${cy1}" r="${r}" fill="${fillColor(ctx.c1)}"/>`,
      `<circle cx="${cx2}" cy="${cy2}" r="${r}" fill="${fillColor(ctx.c1)}"/>`,
    ].join(''),
  );
};

/** 同心圆环 */
export const renderConcentric: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 28);
  const cx = (unit / 2).toFixed(2);
  const stroke = strokeForCell(unit, 0.1);
  const r1 = (unit * 0.2).toFixed(2);
  const r2 = (unit * 0.35).toFixed(2);
  const r3 = (unit * 0.48).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="${cx}" cy="${cx}" r="${r3}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<circle cx="${cx}" cy="${cx}" r="${r2}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
      `<circle cx="${cx}" cy="${cx}" r="${r1}" fill="none" stroke="${fillColor(ctx.c1)}" stroke-width="${stroke}"/>`,
    ].join(''),
  );
};

/** 气泡叠层（microbial mat 简化） */
export const renderMicrobial: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const r = (unit * 0.28).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="${(unit * 0.3).toFixed(1)}" cy="${(unit * 0.35).toFixed(1)}" r="${r}" fill="${fillColor(ctx.c1)}" opacity="0.95"/>`,
      `<circle cx="${(unit * 0.72).toFixed(1)}" cy="${(unit * 0.28).toFixed(1)}" r="${r}" fill="${fillColor(ctx.c1)}" opacity="0.88"/>`,
      `<circle cx="${(unit * 0.55).toFixed(1)}" cy="${(unit * 0.68).toFixed(1)}" r="${r}" fill="${fillColor(ctx.c1)}" opacity="0.9"/>`,
    ].join(''),
  );
};

/** 横向波浪线 */
export const renderWaves: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 22);
  const stroke = strokeForCell(unit, 0.09);
  const amp = Math.max(2, unit * 0.15);
  const y = (unit / 2).toFixed(2);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      waveSegment(unit, amp, fillColor(ctx.c1), Number(stroke), Number(y)),
      waveSegment(unit, amp, fillColor(ctx.c1), Number(stroke), Number(y) + amp * 1.2),
    ].join(''),
  );
};

/** 青海波（seigaiha） */
export const renderSeigaiha: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 26);
  const stroke = strokeForCell(unit, 0.07);
  const cx = unit / 2;
  const baseY = unit * 0.72;
  const r1 = unit * 0.42;
  const r2 = unit * 0.28;
  const r3 = unit * 0.14;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      seigaihaArc(cx, baseY, r1, fillColor(ctx.c1), Number(stroke)),
      seigaihaArc(cx, baseY, r2, fillColor(ctx.c1), Number(stroke)),
      seigaihaArc(cx, baseY, r3, fillColor(ctx.c1), Number(stroke)),
    ].join(''),
  );
};
