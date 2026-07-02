/**
 * 正六边形 path（尖顶朝上，中心在 tile 几何中心）
 */
export function hexagonPath(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

/**
 * 等距立方体三面 path（单位立方，左上为原点）
 */
export function isometricCubePaths(
  x: number,
  y: number,
  size: number,
  colors: { top: string; left: string; right: string },
): string {
  const h = size * 0.5;
  const w = size * 0.8660254;
  const top = [
    `M ${x + w / 2},${y}`,
    `L ${x + w},${y + h / 2}`,
    `L ${x + w / 2},${y + h}`,
    `L ${x},${y + h / 2} Z`,
  ].join(' ');
  const left = [
    `M ${x},${y + h / 2}`,
    `L ${x + w / 2},${y + h}`,
    `L ${x + w / 2},${y + h + size}`,
    `L ${x},${y + h / 2 + size} Z`,
  ].join(' ');
  const right = [
    `M ${x + w / 2},${y + h}`,
    `L ${x + w},${y + h / 2}`,
    `L ${x + w},${y + h / 2 + size}`,
    `L ${x + w / 2},${y + h + size} Z`,
  ].join(' ');
  return [
    `<path d="${top}" fill="${colors.top}"/>`,
    `<path d="${left}" fill="${colors.left}"/>`,
    `<path d="${right}" fill="${colors.right}"/>`,
  ].join('');
}

/**
 * 单层青海波半圆弧（从左到右）
 */
export function seigaihaArc(cx: number, baseY: number, radius: number, color: string, stroke: number): string {
  return `<path d="M ${cx - radius},${baseY} A ${radius},${radius} 0 0 1 ${cx + radius},${baseY}" fill="none" stroke="${color}" stroke-width="${stroke}"/>`;
}

/**
 * 简化的横向波浪 path（一段 repeat）
 */
export function waveSegment(width: number, amplitude: number, color: string, stroke: number, yBase: number): string {
  const q = width / 4;
  return `<path d="M 0,${yBase} Q ${q},${yBase - amplitude} ${q * 2},${yBase} T ${width},${yBase}" fill="none" stroke="${color}" stroke-width="${stroke}"/>`;
}

/**
 * 五角星 path
 */
export function starPath(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

/**
 * 心形 path
 */
export function heartPath(cx: number, cy: number, size: number): string {
  const w = size * 0.5;
  const top = cy - size * 0.2;
  const bottom = cy + size * 0.35;
  return [
    `M ${cx.toFixed(2)},${bottom.toFixed(2)}`,
    `C ${(cx - w).toFixed(2)},${(cy - size * 0.05).toFixed(2)} ${(cx - w).toFixed(2)},${(top - size * 0.35).toFixed(2)} ${cx.toFixed(2)},${top.toFixed(2)}`,
    `C ${(cx + w).toFixed(2)},${(top - size * 0.35).toFixed(2)} ${(cx + w).toFixed(2)},${(cy - size * 0.05).toFixed(2)} ${cx.toFixed(2)},${bottom.toFixed(2)} Z`,
  ].join(' ');
}

/**
 * 阴阳纹简化 path（含双眼）
 */
export function yinYangTile(cx: number, cy: number, radius: number, c1: string, c2: string): string {
  const dot = (radius * 0.12).toFixed(2);
  const half = radius / 2;
  return [
    `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${c2}"/>`,
    `<path d="M ${cx},${cy - radius} A ${radius},${radius} 0 0,1 ${cx},${cy + radius} A ${half},${half} 0 0,0 ${cx},${cy} A ${half},${half} 0 0,1 ${cx},${cy - radius}" fill="${c1}"/>`,
    `<circle cx="${cx}" cy="${(cy - half).toFixed(2)}" r="${dot}" fill="${c2}"/>`,
    `<circle cx="${cx}" cy="${(cy + half).toFixed(2)}" r="${dot}" fill="${c1}"/>`,
  ].join('');
}

/**
 * 鱼鳞弧（单行）
 */
export function scaleArc(x: number, baseY: number, radius: number, color: string, stroke: number): string {
  return `<path d="M ${x},${baseY} A ${radius},${radius} 0 0 1 ${x + radius * 2},${baseY}" fill="none" stroke="${color}" stroke-width="${stroke}"/>`;
}
