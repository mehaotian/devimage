import { seedToInt } from '../../common/seed';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

/**
 * 渲染旋转对称花朵头像
 */
export function renderFlower(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'flower-bg', 38, 22);
  const petal = seedColor(seed, 'flower-petal', 68, 62);
  const petalAlt = seedColor(seed, 'flower-petal-alt', 72, 52);
  const center = seedColor(seed, 'flower-center', 75, 48);
  const petals = seedToInt(seed, 'flower-petals', 5, 10);
  const layers = seedToInt(seed, 'flower-layers', 1, 2);
  const rot = seedToInt(seed, 'flower-rot', 0, 360);
  const parts: string[] = [`<rect width="100" height="100" fill="${bg}"/>`];

  for (let layer = 0; layer < layers; layer += 1) {
    const orbit = 18 + layer * 10;
    const color = layer % 2 === 0 ? petal : petalAlt;
    const count = petals + layer;
    const layerRot = rot + layer * 12;

    for (let i = 0; i < count; i += 1) {
      const angle = layerRot + (360 / count) * i;
      parts.push(
        `<ellipse cx="50" cy="${50 - orbit}" rx="7" ry="14" fill="${color}" opacity="0.9" transform="rotate(${angle} 50 50)"/>`,
      );
    }
  }

  parts.push(`<circle cx="50" cy="50" r="9" fill="${center}"/>`);
  parts.push(`<circle cx="50" cy="50" r="4" fill="${bg}" opacity="0.25"/>`);

  return wrapSvg(size, parts.join(''));
}
