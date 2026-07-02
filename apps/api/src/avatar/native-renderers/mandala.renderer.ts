import { seedToInt } from '../../common/seed';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

/**
 * 渲染旋转对称曼陀罗（多层花瓣椭圆）
 */
export function renderMandala(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'mandala-bg', 35, 16);
  const colors = [
    seedColor(seed, 'mandala-c1', 72, 58),
    seedColor(seed, 'mandala-c2', 68, 48),
    seedColor(seed, 'mandala-c3', 78, 68),
  ];
  const petals = seedToInt(seed, 'mandala-petals', 6, 12);
  const layers = seedToInt(seed, 'mandala-layers', 4, 7);
  const rotBase = seedToInt(seed, 'mandala-rot', 0, 360);
  const parts: string[] = [`<rect width="100" height="100" fill="${bg}"/>`];

  for (let layer = 0; layer < layers; layer += 1) {
    const orbit = 10 + layer * (36 / layers);
    const color = colors[layer % colors.length] ?? colors[0];
    const opacity = (0.85 - layer * 0.1).toFixed(2);
    const layerRot = rotBase + layer * (180 / petals);

    for (let i = 0; i < petals; i += 1) {
      const angle = layerRot + (360 / petals) * i;
      parts.push(
        `<ellipse cx="50" cy="${(50 - orbit).toFixed(1)}" rx="${(orbit * 0.32).toFixed(1)}" ry="${(orbit * 0.58).toFixed(1)}" fill="${color}" opacity="${opacity}" transform="rotate(${angle.toFixed(1)} 50 50)"/>`,
      );
    }
  }

  parts.push(`<circle cx="50" cy="50" r="7" fill="${colors[2] ?? colors[0]}"/>`);
  parts.push(`<circle cx="50" cy="50" r="3" fill="${bg}"/>`);

  return wrapSvg(size, parts.join(''));
}
