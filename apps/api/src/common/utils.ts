/**
 * 校验并规范化尺寸参数（10–4000）
 */
export function parseDimension(value: string | number, label: string): number {
  const num = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 10 || num > 4000) {
    throw new Error(`Invalid ${label}: must be between 10 and 4000`);
  }
  return num;
}

/**
 * 校验 hex 颜色（3 位或 6 位，不含 #）
 */
export function parseHexColor(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }
  const normalized = value.replace(/^#/, '').toLowerCase();
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/.test(normalized)) {
    throw new Error(`Invalid color: ${value}`);
  }
  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return normalized;
}

/**
 * 截断并转义 SVG 文本
 */
export function escapeSvgText(text: string, maxLength = 50): string {
  const trimmed = text.slice(0, maxLength);
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 由 seed 字符串生成确定性 hue（0–360）
 */
export function seedToHue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

/**
 * HSL 转 hex 背景色
 */
export function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}
