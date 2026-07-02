import { clampCell, fillColor, wrapPattern } from '../helpers';
import { heartPath, scaleArc, starPath, yinYangTile } from './geometry-helpers';
import type { PatternRenderer } from '../types';

/** 确保 pattern 上下文含 c3 高光/点缀色 */
function accent(ctx: { c1: string; c2: string; c3?: string }): string {
  return fillColor(ctx.c3 ?? ctx.c1);
}

/** 五角星 */
export const renderStars: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const cx = unit / 2;
  const cy = unit / 2;
  const star = starPath(cx, cy, unit * 0.38, unit * 0.16);

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`, `<path d="${star}" fill="${fillColor(ctx.c1)}"/>`].join(''),
  );
};

/** 心形 */
export const renderHearts: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 22);
  const cx = unit / 2;
  const cy = unit / 2;
  const heart = heartPath(cx, cy + unit * 0.05, unit * 0.55);

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`, `<path d="${heart}" fill="${fillColor(ctx.c1)}"/>`].join(''),
  );
};

/** 阴阳 */
export const renderYinYang: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 16, 28);
  const cx = unit / 2;
  const cy = unit / 2;
  const r = unit * 0.46;

  return wrapPattern(
    unit,
    unit,
    yinYangTile(cx, cy, r, fillColor(ctx.c1), fillColor(ctx.c2)),
  );
};

/** 星空（c1 + c3 星点） */
export const renderStarryNight: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const c1 = fillColor(ctx.c1);
  const c3 = accent(ctx);
  const dots = [
    { x: unit * 0.2, y: unit * 0.25, r: 1.2, c: c1, o: 1 },
    { x: unit * 0.72, y: unit * 0.18, r: 1, c: c3, o: 0.95 },
    { x: unit * 0.55, y: unit * 0.62, r: 1.4, c: c1, o: 0.9 },
    { x: unit * 0.28, y: unit * 0.72, r: 0.9, c: c3, o: 0.88 },
    { x: unit * 0.82, y: unit * 0.78, r: 1.1, c: c1, o: 0.85 },
  ]
    .map(
      (d) =>
        `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r}" fill="${d.c}" opacity="${d.o}"/>`,
    )
    .join('');

  return wrapPattern(
    unit,
    unit,
    [`<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`, dots].join(''),
  );
};

/** 风车（四象限 pinwheel） */
export const renderPinwheel: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 12, 22);
  const cx = unit / 2;
  const cy = unit / 2;
  const c1 = fillColor(ctx.c1);
  const c3 = accent(ctx);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<path d="M ${cx},${cy} L ${unit},${cy} L ${cx},${unit} Z" fill="${c1}"/>`,
      `<path d="M ${cx},${cy} L ${cx},${unit} L 0,${cy} Z" fill="${c3}"/>`,
      `<path d="M ${cx},${cy} L 0,${cy} L ${cx},0 Z" fill="${c1}" opacity="0.85"/>`,
      `<path d="M ${cx},${cy} L ${cx},0 L ${unit},${cy} Z" fill="${c3}" opacity="0.85"/>`,
    ].join(''),
  );
};

/** 四叶花（quatrefoil） */
export const renderQuatrefoil: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const cx = unit / 2;
  const cy = unit / 2;
  const r = unit * 0.28;
  const d = r * 0.95;
  const c1 = fillColor(ctx.c1);
  const c3 = accent(ctx);

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      `<circle cx="${cx}" cy="${cy - d}" r="${r}" fill="${c1}"/>`,
      `<circle cx="${cx + d}" cy="${cy}" r="${r}" fill="${c3}" opacity="0.9"/>`,
      `<circle cx="${cx}" cy="${cy + d}" r="${r}" fill="${c1}" opacity="0.85"/>`,
      `<circle cx="${cx - d}" cy="${cy}" r="${r}" fill="${c3}" opacity="0.8"/>`,
    ].join(''),
  );
};

/** 鱼鳞 */
export const renderScales: PatternRenderer = (ctx) => {
  const unit = clampCell(ctx.cell * 2, 14, 24);
  const radius = unit * 0.22;
  const stroke = Math.max(0.8, unit * 0.06).toFixed(2);
  const c1 = fillColor(ctx.c1);
  const c3 = accent(ctx);
  const row1 = unit * 0.42;
  const row2 = unit * 0.72;

  return wrapPattern(
    unit,
    unit,
    [
      `<rect width="${unit}" height="${unit}" fill="${fillColor(ctx.c2)}"/>`,
      scaleArc(0, row1, radius, c1, Number(stroke)),
      scaleArc(radius * 2, row1, radius, c1, Number(stroke)),
      scaleArc(radius, row2, radius, c3, Number(stroke)),
      scaleArc(radius * 3, row2, radius, c3, Number(stroke)),
    ].join(''),
  );
};
