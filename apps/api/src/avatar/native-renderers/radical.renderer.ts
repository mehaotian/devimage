import { escapeSvgText } from '../../common/utils';
import { extractInitialChar } from '../../common/text';
import { seedToInt } from '../../common/seed';
import { DEVIMG_PATTERN_IDS } from '../devimg-patterns/catalog';
import { buildPatternContext, renderDevimgPattern } from '../devimg-patterns/index';
import {
  circleClipClose,
  circleClipOpen,
  type NativeRendererInput,
  wrapSvg,
} from './helpers';

/**
 * 由字符 Unicode 推导笔画档（近似）与 pattern 索引
 */
function deriveRadicalMotif(char: string, seed: string): { patternId: string; strokeBucket: number } {
  const codePoint = char.codePointAt(0) ?? 63;
  const strokeBucket = (codePoint % 24) + 1;
  const patternIndex =
    (codePoint + strokeBucket * 7 + seedToInt(seed, 'radical-slot', 0, 1000)) %
    DEVIMG_PATTERN_IDS.length;
  const patternId = DEVIMG_PATTERN_IDS[patternIndex] ?? DEVIMG_PATTERN_IDS[0];

  return { patternId, strokeBucket };
}

/**
 * 渲染部首纹理头像：首字 Unicode → pattern + 居中首字
 */
export function renderRadical(input: NativeRendererInput): string {
  const { seed, size } = input;
  const initial = extractInitialChar(seed);
  const { patternId, strokeBucket } = deriveRadicalMotif(initial, seed);
  const patternSeed = `${seed}:radical:${initial}:${strokeBucket}`;
  const ctx = buildPatternContext(patternSeed, patternId);
  const pattern = renderDevimgPattern(patternSeed, patternId);
  const fg = `#${ctx.c3}`;

  const body = [
    circleClipOpen(),
    pattern.defs,
    pattern.body,
    `<text x="50" y="50" text-anchor="middle" dy="0.35em"`,
    ` fill="${fg}" font-family="system-ui,sans-serif" font-size="38" font-weight="600" opacity="0.92">`,
    escapeSvgText(initial, 2),
    `</text>`,
    circleClipClose(),
  ].join('');

  return wrapSvg(size, body);
}
