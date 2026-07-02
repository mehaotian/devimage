import { seedToInt } from '../../common/seed';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

/**
 * 渲染极简机器人头像（primitive 几何）
 */
export function renderBot(input: NativeRendererInput): string {
  const { seed, size } = input;
  const bg = seedColor(seed, 'bot-bg', 38, 18);
  const body = seedColor(seed, 'bot-body', 55, 55);
  const accent = seedColor(seed, 'bot-accent', 72, 62);
  const eye = seedColor(seed, 'bot-eye', 80, 75);
  const mouthOpen = seedToInt(seed, 'bot-mouth', 0, 3);
  const antennaH = seedToInt(seed, 'bot-antenna', 6, 12);

  const mouthPaths = [
    `<rect x="42" y="58" width="16" height="3" rx="1" fill="${accent}"/>`,
    `<rect x="40" y="56" width="20" height="8" rx="2" fill="none" stroke="${accent}" stroke-width="2"/>`,
    `<line x1="40" y1="60" x2="60" y2="60" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>`,
  ];

  const parts = [
    `<rect width="100" height="100" fill="${bg}"/>`,
    `<line x1="50" y1="18" x2="50" y2="${22 - antennaH}" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>`,
    `<circle cx="50" cy="${16 - antennaH}" r="3" fill="${eye}"/>`,
    `<rect x="28" y="24" width="44" height="40" rx="8" fill="${body}"/>`,
    `<circle cx="40" cy="42" r="5" fill="${eye}"/>`,
    `<circle cx="60" cy="42" r="5" fill="${eye}"/>`,
    `<circle cx="40" cy="42" r="2" fill="${bg}"/>`,
    `<circle cx="60" cy="42" r="2" fill="${bg}"/>`,
    mouthPaths[mouthOpen] ?? mouthPaths[0],
    `<rect x="34" y="68" width="32" height="18" rx="6" fill="${body}" opacity="0.9"/>`,
    `<rect x="38" y="72" width="8" height="10" rx="2" fill="${accent}" opacity="0.5"/>`,
    `<rect x="54" y="72" width="8" height="10" rx="2" fill="${accent}" opacity="0.5"/>`,
  ];

  return wrapSvg(size, parts.join(''));
}
