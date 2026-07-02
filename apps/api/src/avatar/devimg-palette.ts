import { hslToHex } from '../common/utils';
import { seedToInt, seedToUnit } from '../common/seed';

/** 渐变圆双色 + 高光 */
export interface DevimgGradientColors {
  readonly c1: string;
  readonly c2: string;
  readonly c3: string;
  readonly angle: number;
  readonly fx: string;
  readonly fy: string;
}

/**
 * 渐变圆配色：两色相差明显 + 同侧高光（不用互补色，避免发灰）
 */
export function buildGradientColors(seed: string): DevimgGradientColors {
  const h1 = seedToInt(seed, 'h1', 0, 360);
  const h2 = (h1 + seedToInt(seed, 'h2', 45, 155)) % 360;
  const h3 = (h1 + seedToInt(seed, 'h3', 25, 55)) % 360;

  const c1 = hslToHex(h1, 70, 58);
  const c2 = hslToHex(h2, 74, 46);
  const c3 = hslToHex(h3, 76, 68);

  const angle = seedToInt(seed, 'angle', 0, 360);
  const fx = (seedToUnit(seed, 'cx') * 30 + 35).toFixed(1);
  const fy = (seedToUnit(seed, 'cy') * 30 + 35).toFixed(1);

  return { c1, c2, c3, angle, fx, fy };
}

/**
 * 彩虹 mesh 单个光斑参数
 */
export interface RainbowMeshBlob {
  readonly color: string;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

/**
 * 网格渐变：4 色 rainbow 光斑 + 浅色底
 */
export function buildRainbowMeshBlobs(seed: string): { background: string; blobs: RainbowMeshBlob[] } {
  const baseHue = seedToInt(seed, 'mesh-h', 0, 360);
  const blobCount = 4;
  const rot = seedToInt(seed, 'mesh-rot', 0, 360);
  const background = hslToHex((baseHue + 200) % 360, 35, 92);
  const blobs: RainbowMeshBlob[] = [];

  for (let i = 0; i < blobCount; i++) {
    const hue = (baseHue + i * 90 + seedToInt(seed, `mesh-dh-${i}`, -15, 15)) % 360;
    const color = hslToHex(hue, 78, 56);
    const angleDeg = rot + (360 / blobCount) * i;
    const dist = 14 + seedToInt(seed, `mesh-dist-${i}`, 0, 12);
    const rad = (angleDeg * Math.PI) / 180;
    const cx = 50 + dist * Math.cos(rad);
    const cy = 50 + dist * Math.sin(rad);
    const radius = 38 + seedToInt(seed, `mesh-r-${i}`, 0, 10);

    blobs.push({ color, cx, cy, radius });
  }

  return { background, blobs };
}
