import { seedToInt } from '../../common/seed';
import {
  type NativeRendererInput,
  sampleHeightField,
  seedColor,
  wrapSvg,
} from './helpers';

const TOPO_LEVELS = [0.28, 0.42, 0.56, 0.7, 0.84] as const;
const TOPO_STEP = 2;

/**
 * 沿等高线阈值追踪并生成闭合 SVG path
 */
function traceContour(seed: string, level: number): string {
  const points: Array<[number, number]> = [];

  for (let y = 0; y <= 100; y += TOPO_STEP) {
    for (let x = 0; x <= 100; x += TOPO_STEP) {
      const h = sampleHeightField(seed, x / 10, y / 10);
      if (Math.abs(h - level) < 0.045) {
        points.push([x, y]);
      }
    }
  }

  if (points.length < 8) {
    return '';
  }

  const [startX, startY] = points[0] ?? [50, 50];
  const segments = points
    .slice(1, 48)
    .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  return `<path d="M ${startX.toFixed(1)} ${startY.toFixed(1)} ${segments} Z" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/**
 * 渲染等高线地形图风格头像
 */
export function renderTopo(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'topo-bg', 42, 22);
  const stroke = seedColor(seed, 'topo-stroke', 55, 72);
  const accent = seedColor(seed, 'topo-accent', 70, 45);
  const contourCount = seedToInt(seed, 'topo-count', 4, TOPO_LEVELS.length + 1);
  const parts: string[] = [
    `<rect width="100" height="100" fill="${bg}"/>`,
    `<radialGradient id="topo-glow" cx="50%" cy="45%" r="55%">`,
    `<stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>`,
    `<stop offset="100%" stop-color="${bg}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<rect width="100" height="100" fill="url(#topo-glow)"/>`,
  ];

  for (let i = 0; i < contourCount; i += 1) {
    const level = TOPO_LEVELS[i] ?? TOPO_LEVELS[TOPO_LEVELS.length - 1];
    const path = traceContour(seed, level);
    if (path) {
      parts.push(
        path.replace(
          'fill="none"',
          `fill="none" stroke="${stroke}"`,
        ),
      );
    }
  }

  return wrapSvg(size, parts.join(''));
}
