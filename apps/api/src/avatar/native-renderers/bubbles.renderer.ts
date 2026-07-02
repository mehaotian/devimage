import { seedToInt, seedToUnit } from '../../common/seed';
import {
  circlesOverlap,
  type NativeRendererInput,
  seedColor,
  wrapSvg,
} from './helpers';

interface Bubble {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly color: string;
}

/**
 * 渲染圆堆积（bubble packing）抽象头像
 */
export function renderBubbles(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'bubbles-bg', 38, 20);
  const palette = [
    seedColor(seed, 'bubbles-c1', 70, 62),
    seedColor(seed, 'bubbles-c2', 65, 52),
    seedColor(seed, 'bubbles-c3', 75, 72),
    seedColor(seed, 'bubbles-c4', 60, 42),
  ];
  const targetCount = seedToInt(seed, 'bubbles-count', 10, 16);
  const bubbles: Bubble[] = [];

  for (let attempt = 0; attempt < 80 && bubbles.length < targetCount; attempt += 1) {
    const r = 6 + seedToInt(seed, `bubbles-r-${attempt}`, 0, 14);
    const x = 8 + seedToUnit(seed, `bubbles-x-${attempt}`) * 84;
    const y = 8 + seedToUnit(seed, `bubbles-y-${attempt}`) * 84;
    const color = palette[bubbles.length % palette.length] ?? palette[0];
    const overlaps = bubbles.some((b) => circlesOverlap(x, y, r, b.x, b.y, b.r));

    if (!overlaps) {
      bubbles.push({ x, y, r, color });
    }
  }

  const parts: string[] = [`<rect width="100" height="100" fill="${bg}"/>`];

  bubbles
    .sort((a, b) => a.r - b.r)
    .forEach((bubble) => {
      parts.push(
        `<circle cx="${bubble.x.toFixed(1)}" cy="${bubble.y.toFixed(1)}" r="${bubble.r.toFixed(1)}" fill="${bubble.color}" opacity="0.88"/>`,
      );
    });

  return wrapSvg(size, parts.join(''));
}
