import { hslToHex } from '../../common/utils';
import { seedToInt, seedToUnit } from '../../common/seed';
import { type NativeRendererInput, wrapSvg } from './helpers';

const CX = 50;
const CY = 50;

/** 单段圆弧绘制参数 */
interface GeoArcSpec {
  readonly radius: number;
  readonly startDeg: number;
  readonly sweepDeg: number;
  readonly color: string;
  readonly strokeWidth: number;
}

/**
 * 生成 SVG 圆弧 path（角度制，圆角端点）
 */
function describeArc(spec: GeoArcSpec): string {
  const { radius, startDeg, sweepDeg, color, strokeWidth } = spec;
  const start = ((startDeg % 360) * Math.PI) / 180;
  const end = (((startDeg + sweepDeg) % 360) * Math.PI) / 180;
  const x1 = CX + radius * Math.cos(start);
  const y1 = CY + radius * Math.sin(start);
  const x2 = CX + radius * Math.cos(end);
  const y2 = CY + radius * Math.sin(end);
  const large = sweepDeg > 180 ? 1 : 0;
  return [
    `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}"`,
    `stroke="${color}" stroke-width="${strokeWidth.toFixed(2)}" stroke-linecap="round" fill="none"/>`,
  ].join(' ');
}

/**
 * 由 seed 构建双色 palette
 */
function buildGeoPalette(seed: string): { bg: string; primary: string; secondary: string } {
  const hBase = seedToInt(seed, 'geo-h', 0, 360);
  return {
    bg: `#${hslToHex(hBase, 22, 97)}`,
    primary: `#${hslToHex(hBase, 56, 48)}`,
    secondary: `#${hslToHex((hBase + 40) % 360, 38, 74)}`,
  };
}

/**
 * 同心环半径阶梯（3–4 层，间距一致）
 */
function buildRingRadii(seed: string): number[] {
  const ringCount = seedToInt(seed, 'ring-count', 3, 4);
  const start = seedToInt(seed, 'ring-r0', 14, 16);
  const step = seedToInt(seed, 'ring-step', 9, 10);
  return Array.from({ length: ringCount }, (_, ring) => start + ring * step);
}

/**
 * 经典同心弧环：每层 2–3 段，等分槽位 + 固定比例留白，层间相位错开
 */
function buildLayeredRings(
  seed: string,
  radii: number[],
  primary: string,
  secondary: string,
): GeoArcSpec[] {
  const arcs: GeoArcSpec[] = [];
  const baseRot = seedToInt(seed, 'ring-base-rot', 0, 359);

  for (let ring = 0; ring < radii.length; ring += 1) {
    const radius = radii[ring] ?? radii[radii.length - 1] ?? 14;
    const segments = seedToInt(seed, `ring-seg-${ring}`, 2, 3);
    const phase = baseRot + ring * seedToInt(seed, `ring-phase-${ring}`, 18, 42);
    const slotDeg = 360 / segments;
    const gapRatio = 0.34 + seedToUnit(seed, `ring-gap-${ring}`) * 0.1;
    const gapDeg = slotDeg * gapRatio;
    const sweepDeg = Math.max(18, slotDeg - gapDeg);
    const strokeWidth = 2.4 - ring * 0.22;

    for (let s = 0; s < segments; s += 1) {
      arcs.push({
        radius,
        startDeg: phase + slotDeg * s + gapDeg / 2,
        sweepDeg,
        color: (ring + s) % 2 === 0 ? primary : secondary,
        strokeWidth,
      });
    }
  }

  return arcs;
}

/**
 * 双弧环：每层仅 2 段对称呼，更简洁
 */
function buildDualArcRings(
  seed: string,
  radii: number[],
  primary: string,
  secondary: string,
): GeoArcSpec[] {
  const arcs: GeoArcSpec[] = [];
  const baseRot = seedToInt(seed, 'dual-rot', 0, 359);
  const sweepDeg = seedToInt(seed, 'dual-sweep', 52, 78);

  for (let ring = 0; ring < radii.length; ring += 1) {
    const radius = radii[ring] ?? radii[radii.length - 1] ?? 14;
    const phase = baseRot + ring * seedToInt(seed, `dual-phase-${ring}`, 12, 36);
    const strokeWidth = 2.3 - ring * 0.2;

    for (let s = 0; s < 2; s += 1) {
      arcs.push({
        radius,
        startDeg: phase + 180 * s + seedToInt(seed, `dual-off-${ring}-${s}`, 4, 14),
        sweepDeg,
        color: s === 0 ? primary : secondary,
        strokeWidth,
      });
    }
  }

  return arcs;
}

/**
 * 单弧环：每层 1 段长弧，层间旋转递进
 */
function buildSingleArcRings(
  seed: string,
  radii: number[],
  primary: string,
  secondary: string,
): GeoArcSpec[] {
  const arcs: GeoArcSpec[] = [];
  const baseRot = seedToInt(seed, 'single-rot', 0, 359);
  const sweepDeg = seedToInt(seed, 'single-sweep', 64, 96);

  for (let ring = 0; ring < radii.length; ring += 1) {
    const radius = radii[ring] ?? radii[radii.length - 1] ?? 14;
    arcs.push({
      radius,
      startDeg: baseRot + ring * seedToInt(seed, `single-step-${ring}`, 28, 52),
      sweepDeg,
      color: ring % 2 === 0 ? primary : secondary,
      strokeWidth: 2.35 - ring * 0.18,
    });
  }

  return arcs;
}

/**
 * 按 seed 选择同心环变体并生成弧段
 */
function buildGeoArcs(
  seed: string,
  primary: string,
  secondary: string,
): GeoArcSpec[] {
  const radii = buildRingRadii(seed);
  const variant = seedToInt(seed, 'geo-variant', 0, 3);

  switch (variant) {
    case 1:
      return buildDualArcRings(seed, radii, primary, secondary);
    case 2:
      return buildSingleArcRings(seed, radii, primary, secondary);
    default:
      return buildLayeredRings(seed, radii, primary, secondary);
  }
}

/**
 * 绘制中心圆点
 */
function renderGeoCenter(seed: string, primary: string, secondary: string): string {
  const style = seedToInt(seed, 'geo-core-style', 0, 2);

  if (style === 1) {
    return `<circle cx="${CX}" cy="${CY}" r="5" fill="none" stroke="${primary}" stroke-width="1.8"/>`;
  }

  if (style === 2) {
    return [
      `<circle cx="${CX}" cy="${CY}" r="5.5" fill="${secondary}" opacity="0.9"/>`,
      `<circle cx="${CX}" cy="${CY}" r="2.5" fill="${primary}"/>`,
    ].join('');
  }

  return `<circle cx="${CX}" cy="${CY}" r="${seedToInt(seed, 'geo-core-r', 5, 6)}" fill="${primary}"/>`;
}

/**
 * 渲染几何弧环头像（同心环 + 层间相位变化，避免散落弧段）
 */
export function renderGeo(input: NativeRendererInput): string {
  const { seed, size } = input;
  const { bg, primary, secondary } = buildGeoPalette(seed);
  const arcs = buildGeoArcs(seed, primary, secondary);

  const body = [
    `<rect width="100" height="100" fill="${bg}"/>`,
    ...arcs.map((arc) => describeArc(arc)),
    renderGeoCenter(seed, primary, secondary),
  ].join('');

  return wrapSvg(size, body);
}
