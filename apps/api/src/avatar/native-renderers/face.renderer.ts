import { seedToInt } from '../../common/seed';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

/**
 * 渲染 procedural 表情头像（圆眼 + 弧嘴）
 */
export function renderFace(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'face-bg', 40, 20);
  const skin = seedColor(seed, 'face-skin', 55, 72);
  const feature = seedColor(seed, 'face-feature', 35, 28);
  const cheek = seedColor(seed, 'face-cheek', 70, 65);
  const mood = seedToInt(seed, 'face-mood', 0, 4);
  const eyeStyle = seedToInt(seed, 'face-eye', 0, 2);

  const eyes =
    eyeStyle === 0
      ? [
          `<circle cx="38" cy="44" r="4.5" fill="${feature}"/>`,
          `<circle cx="62" cy="44" r="4.5" fill="${feature}"/>`,
        ]
      : eyeStyle === 1
        ? [
            `<ellipse cx="38" cy="44" rx="5" ry="3" fill="${feature}"/>`,
            `<ellipse cx="62" cy="44" rx="5" ry="3" fill="${feature}"/>`,
          ]
        : [
            `<path d="M 33 42 Q 38 48 43 42" fill="none" stroke="${feature}" stroke-width="2.5" stroke-linecap="round"/>`,
            `<path d="M 57 42 Q 62 48 67 42" fill="none" stroke="${feature}" stroke-width="2.5" stroke-linecap="round"/>`,
          ];

  const mouths = [
    `<path d="M 38 62 Q 50 72 62 62" fill="none" stroke="${feature}" stroke-width="2.8" stroke-linecap="round"/>`,
    `<path d="M 40 66 Q 50 58 60 66" fill="none" stroke="${feature}" stroke-width="2.8" stroke-linecap="round"/>`,
    `<ellipse cx="50" cy="64" rx="6" ry="4" fill="${feature}"/>`,
    `<line x1="42" y1="64" x2="58" y2="64" stroke="${feature}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<circle cx="50" cy="63" r="3" fill="none" stroke="${feature}" stroke-width="2"/>`,
  ];

  const parts = [
    `<rect width="100" height="100" fill="${bg}"/>`,
    `<circle cx="50" cy="52" r="32" fill="${skin}"/>`,
    `<circle cx="30" cy="58" r="5" fill="${cheek}" opacity="0.35"/>`,
    `<circle cx="70" cy="58" r="5" fill="${cheek}" opacity="0.35"/>`,
    ...eyes,
    mouths[mood] ?? mouths[0],
  ];

  return wrapSvg(size, parts.join(''));
}
