import { fnv1a32 } from '../../common/seed';
import { hslToHex } from '../../common/utils';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

const BAR_COUNT = 8;

/**
 * 由 hash 字节生成色条颜色
 */
function barColor(hash: number, index: number): string {
  const shift = (index * 4) % 24;
  const n = (hash >>> shift) & 0xff;
  const hue = (n * 360) / 255;
  const light = 42 + (n % 28);
  return `#${hslToHex(Math.floor(hue), 68, light)}`;
}

/**
 * 渲染 seed 哈希色条可视化头像
 */
export function renderHash(input: NativeRendererInput): string {
  const { seed, size } = input;
  const digest = fnv1a32(seed);
  const bg = seedColor(seed, 'hash-bg', 35, 14);
  const barW = 100 / BAR_COUNT;
  const parts: string[] = [`<rect width="100" height="100" fill="${bg}"/>`];

  for (let i = 0; i < BAR_COUNT; i += 1) {
    const color = barColor(digest, i);
    const h = 35 + ((digest >>> (i * 3)) & 0x3f);
    parts.push(
      `<rect x="${(i * barW).toFixed(2)}" y="${(100 - h).toFixed(1)}" width="${barW.toFixed(2)}" height="${h.toFixed(1)}" fill="${color}"/>`,
    );
  }

  const hex = digest.toString(16).padStart(8, '0').slice(0, 8);
  parts.push(
    `<text x="50" y="18" text-anchor="middle" fill="#ffffff" opacity="0.85" font-family="ui-monospace,monospace" font-size="8">${hex}</text>`,
  );

  return wrapSvg(size, parts.join(''));
}
