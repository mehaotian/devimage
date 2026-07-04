import { hslToHex } from '../../common/utils';
import { seedToInt, seedToUnit } from '../../common/seed';

/** native 渲染器通用输入 */
export interface NativeRendererInput {
  readonly seed: string;
  readonly size: number;
  readonly shape?: 'circle' | 'square';
}

/** native 风格渲染函数签名 */
export type NativeStyleRenderer = (input: NativeRendererInput) => string;

/**
 * 由 seed 生成 HSL 十六进制色
 */
export function seedColor(
  seed: string,
  slot: string,
  saturation = 65,
  lightness = 55,
): string {
  const hue = seedToInt(seed, slot, 0, 360);
  return `#${hslToHex(hue, saturation, lightness)}`;
}

/**
 * 组装标准 viewBox 100×100 的 SVG 根节点
 */
export function wrapSvg(size: number, body: string, defs = ''): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">`,
    defs,
    body,
    `</svg>`,
  ].join('');
}

/**
 * 圆形裁剪 defs + 开始 g 标签
 */
export function circleClipOpen(): string {
  return [
    `<defs><clipPath id="clip"><circle cx="50" cy="50" r="50"/></clipPath></defs>`,
    `<g clip-path="url(#clip)">`,
  ].join('');
}

/**
 * 结束圆形裁剪 g 标签
 */
export function circleClipClose(): string {
  return `</g>`;
}

/**
 * 为算法 native SVG 套上圆形裁剪（方形或未裁剪时原样返回）
 */
export function applyAvatarShapeClip(svg: string, shape: 'circle' | 'square'): string {
  if (shape === 'square') {
    return svg;
  }
  if (svg.includes('<clipPath id="clip"') || svg.includes('clip-path="url(#clip)"')) {
    return svg;
  }

  return svg.replace(
    /^(<svg[\s\S]*?>)([\s\S]*)(<\/svg>)$/i,
    (_match, openTag: string, inner: string, closeTag: string) => {
      const clipDef =
        '<defs><clipPath id="devimg-shape-clip"><circle cx="50" cy="50" r="50"/></clipPath></defs>';
      const defsMatch = inner.match(/^(\s*<defs[\s\S]*?<\/defs>)/);
      if (defsMatch) {
        const defsBlock = defsMatch[1];
        const rest = inner.slice(defsBlock.length);
        return `${openTag}${defsBlock}${clipDef}<g clip-path="url(#devimg-shape-clip)">${rest}</g>${closeTag}`;
      }
      return `${openTag}${clipDef}<g clip-path="url(#devimg-shape-clip)">${inner}</g>${closeTag}`;
    },
  );
}

/**
 * 在 viewBox 内采样伪高度场（0–1）
 */
export function sampleHeightField(seed: string, x: number, y: number): number {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  let total = 0;
  let weight = 0;

  for (let octave = 1; octave <= 3; octave += 1) {
    const factor = 1 / octave;
    total += seedToUnit(seed, `topo-${gx * octave}-${gy * octave}`) * factor;
    weight += factor;
  }

  const wave =
    Math.sin(x * 0.35 + seedToUnit(seed, 'topo-wx') * 6) *
    Math.cos(y * 0.28 + seedToUnit(seed, 'topo-wy') * 6) *
    0.12;

  return Math.min(1, Math.max(0, total / weight + wave));
}

/**
 * 检测两圆是否重叠（含 padding）
 */
export function circlesOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  padding = 1,
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const minDist = r1 + r2 + padding;
  return dx * dx + dy * dy < minDist * minDist;
}
