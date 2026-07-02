import { seedToInt } from '../../common/seed';
import { hslToHex } from '../../common/utils';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

const PIXEL_GRID = 16;

/**
 * 渲染 16×16 抽象像素网格头像
 */
export function renderPixel(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'pixel-bg', 30, 14);
  const baseHue = seedToInt(seed, 'pixel-h', 0, 360);
  const cell = 100 / PIXEL_GRID;
  const parts: string[] = [`<rect width="100" height="100" fill="${bg}"/>`];

  for (let row = 0; row < PIXEL_GRID; row += 1) {
    for (let col = 0; col < PIXEL_GRID; col += 1) {
      const on = seedToInt(seed, `pixel-${row}-${col}`, 0, 100) > 42;
      if (!on) {
        continue;
      }

      const hue = (baseHue + seedToInt(seed, `pixel-h-${row}-${col}`, -30, 30) + 360) % 360;
      const color = `#${hslToHex(hue, 72, seedToInt(seed, `pixel-l-${row}-${col}`, 42, 68))}`;
      parts.push(
        `<rect x="${(col * cell).toFixed(2)}" y="${(row * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${color}"/>`,
      );
    }
  }

  return wrapSvg(size, parts.join(''));
}
