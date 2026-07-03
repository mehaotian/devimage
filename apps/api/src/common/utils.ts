/** SVG 尺寸上限 */
export const MAX_DIMENSION = 4000;

/** 栅格化输出尺寸上限（防 CPU/内存滥用） */
export const RASTER_MAX_DIMENSION = 1024;

/** 默认最小尺寸 */
export const MIN_DIMENSION = 10;

/**
 * 校验并规范化尺寸参数（10–4000）
 */
export function parseDimension(value: string | number, label: string): number {
  const num = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < MIN_DIMENSION || num > MAX_DIMENSION) {
    throw new Error(`Invalid ${label}: must be between ${MIN_DIMENSION} and ${MAX_DIMENSION}`);
  }
  return num;
}

/**
 * 校验栅格化尺寸（10–1024）
 */
export function parseRasterDimension(value: string | number, label: string): number {
  const num = parseDimension(value, label);
  if (num > RASTER_MAX_DIMENSION) {
    throw new Error(
      `Invalid ${label}: raster max is ${RASTER_MAX_DIMENSION}. Use SVG for larger sizes.`,
    );
  }
  return num;
}

/**
 * 解析可选 query 尺寸，缺省返回 defaultValue
 */
export function parseOptionalDimension(
  value: string | undefined,
  label: string,
  defaultValue: number,
): number {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return parseDimension(value, label);
}

/**
 * 解析列表 count 参数（1–max，非法抛错）
 */
export function parseBoundedCount(
  value: string | undefined,
  defaultValue: number,
  max: number,
): number {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1 || num > max) {
    throw new Error(`Invalid count: must be between 1 and ${max}`);
  }
  return num;
}

/**
 * 解析正整数 path/query 参数
 */
export function parsePositiveInt(value: string, label: string, min = 1, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new Error(`Invalid ${label}: must be between ${min} and ${max}`);
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
 * HSL 转 hex 背景色（h: 0–360，s/l: 0–100）
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const chroma = sat * Math.min(light, 1 - light);

  /**
   * 计算单个 RGB 通道（0–255）
   */
  const channel = (n: number): string => {
    const k = (n + h / 30) % 12;
    const rgb = light - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const clamped = Math.min(255, Math.max(0, Math.round(255 * rgb)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `${channel(0)}${channel(8)}${channel(4)}`;
}
