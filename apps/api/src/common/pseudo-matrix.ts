import { fnv1a32, seedToInt } from './seed';
import { hslToHex, parseHexColor } from './utils';

const MATRIX_SIZE = 21;
const MODULE = 100 / MATRIX_SIZE;
const FINDER = 7;

/** 伪 QR 视觉变体 */
export type PseudoMatrixVariant = 'matrix' | 'minimal' | 'dots';

/** 伪 QR 矩阵可选配色（hex，含 `#`） */
export interface PseudoMatrixColors {
  readonly dark?: string;
  readonly light?: string;
  readonly accent?: string;
}

/** 伪 QR 矩阵渲染选项 */
export interface PseudoMatrixOptions {
  readonly seed: string;
  readonly width: number;
  readonly height?: number;
  readonly colors?: PseudoMatrixColors;
  readonly variant?: PseudoMatrixVariant;
  /** 模块圆角，0–50（占模块边长比例 %） */
  readonly radius?: number;
}

/**
 * 解析伪 QR 视觉变体
 */
export function parsePseudoMatrixVariant(value: string | undefined): PseudoMatrixVariant {
  if (!value || value === '') {
    return 'matrix';
  }
  const normalized = value.toLowerCase();
  if (normalized === 'matrix' || normalized === 'minimal' || normalized === 'dots') {
    return normalized;
  }
  throw new Error('Invalid variant. Use: matrix, minimal, dots');
}

/**
 * 解析模块圆角 query（0–50）
 */
export function parseMatrixRadius(value: string | undefined): number {
  if (value === undefined || value === '') {
    return 0;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 0 || num > 50) {
    throw new Error('Invalid radius: must be between 0 and 50');
  }
  return num;
}

/**
 * 标记 QR Version 1（21×21）保留区：定位符、分隔带、时序纹
 */
function buildReservedGrid(): boolean[][] {
  const grid = Array.from({ length: MATRIX_SIZE }, () =>
    Array<boolean>(MATRIX_SIZE).fill(false),
  );

  const markRect = (x0: number, y0: number, w: number, h: number) => {
    for (let y = y0; y < y0 + h && y < MATRIX_SIZE; y += 1) {
      for (let x = x0; x < x0 + w && x < MATRIX_SIZE; x += 1) {
        grid[y]![x] = true;
      }
    }
  };

  markRect(0, 0, 8, 8);
  markRect(MATRIX_SIZE - 8, 0, 8, 8);
  markRect(0, MATRIX_SIZE - 8, 8, 8);

  for (let x = 8; x < MATRIX_SIZE; x += 1) {
    grid[6]![x] = true;
  }
  for (let y = 8; y < MATRIX_SIZE; y += 1) {
    grid[y]![6] = true;
  }

  grid[13]![8] = true;

  return grid;
}

const RESERVED = buildReservedGrid();

/**
 * 解析矩阵配色：query 传入优先，否则由 seed 推导
 */
function resolveMatrixColor(
  value: string | undefined,
  seed: string,
  slot: string,
  saturation: number,
  lightness: number,
): string {
  if (value) {
    const raw = value.startsWith('#') ? value.slice(1) : value;
    return `#${parseHexColor(raw, '000000')}`;
  }
  const hue = seedToInt(seed, slot, 0, 360);
  return `#${hslToHex(hue, saturation, lightness)}`;
}

/**
 * 绘制标准 QR 定位符（7×7 黑框 + 5×5 白底 + 3×3 黑芯）
 */
function renderFinderPattern(ox: number, oy: number, dark: string, light: string): string {
  const x = ox * MODULE;
  const y = oy * MODULE;
  const s7 = FINDER * MODULE;
  const s5 = 5 * MODULE;
  const s3 = 3 * MODULE;
  const pad1 = MODULE;
  const pad2 = 2 * MODULE;

  return [
    `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${s7.toFixed(3)}" height="${s7.toFixed(3)}" fill="${dark}"/>`,
    `<rect x="${(x + pad1).toFixed(3)}" y="${(y + pad1).toFixed(3)}" width="${s5.toFixed(3)}" height="${s5.toFixed(3)}" fill="${light}"/>`,
    `<rect x="${(x + pad2).toFixed(3)}" y="${(y + pad2).toFixed(3)}" width="${s3.toFixed(3)}" height="${s3.toFixed(3)}" fill="${dark}"/>`,
  ].join('');
}

/**
 * 绘制时序纹（行列 6 上的交替模块）
 */
function renderTimingPatterns(dark: string, light: string): string {
  const parts: string[] = [];

  for (let x = 8; x < MATRIX_SIZE; x += 1) {
    if (x >= MATRIX_SIZE - 8 && x < MATRIX_SIZE) {
      continue;
    }
    const fill = x % 2 === 0 ? dark : light;
    parts.push(
      `<rect x="${(x * MODULE).toFixed(3)}" y="${(6 * MODULE).toFixed(3)}" width="${MODULE.toFixed(3)}" height="${MODULE.toFixed(3)}" fill="${fill}"/>`,
    );
  }

  for (let y = 8; y < MATRIX_SIZE; y += 1) {
    if (y >= MATRIX_SIZE - 8 && y < MATRIX_SIZE) {
      continue;
    }
    const fill = y % 2 === 0 ? dark : light;
    parts.push(
      `<rect x="${(6 * MODULE).toFixed(3)}" y="${(y * MODULE).toFixed(3)}" width="${MODULE.toFixed(3)}" height="${MODULE.toFixed(3)}" fill="${fill}"/>`,
    );
  }

  parts.push(
    `<rect x="${(8 * MODULE).toFixed(3)}" y="${(13 * MODULE).toFixed(3)}" width="${MODULE.toFixed(3)}" height="${MODULE.toFixed(3)}" fill="${dark}"/>`,
  );

  return parts.join('');
}

/**
 * 由 seed 与坐标推导模块是否填充（高位混合，避免条纹）
 */
function isModuleFilled(seed: string, x: number, y: number): boolean {
  const hash = fnv1a32(`${seed}\0${x}\0${y}`);
  const mixed = (hash ^ (hash >>> 11) ^ (hash << 5)) >>> 0;
  return (mixed & 0xff) > 118;
}

/**
 * 少量强调色模块（约 6%）
 */
function isAccentModule(seed: string, x: number, y: number): boolean {
  const hash = fnv1a32(`${seed}\0accent\0${x}\0${y}`);
  return (hash & 0xff) > 240;
}

/**
 * 绘制单个数据模块（rect 或圆点）
 */
function renderDataModule(
  x: number,
  y: number,
  fill: string,
  variant: PseudoMatrixVariant,
  radius: number,
): string {
  const px = (x * MODULE).toFixed(3);
  const py = (y * MODULE).toFixed(3);
  const size = MODULE.toFixed(3);

  if (variant === 'dots') {
    const cx = (x * MODULE + MODULE / 2).toFixed(3);
    const cy = (y * MODULE + MODULE / 2).toFixed(3);
    const r = (MODULE * 0.38).toFixed(3);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
  }

  if (radius > 0) {
    const rx = ((MODULE * radius) / 100).toFixed(3);
    return `<rect x="${px}" y="${py}" width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="${fill}"/>`;
  }

  return `<rect x="${px}" y="${py}" width="${size}" height="${size}" fill="${fill}"/>`;
}

/**
 * 组装 SVG 根节点；非正方形时使用 meet 留 quiet zone
 */
function wrapMatrixSvg(width: number, height: number, body: string): string {
  const preserve =
    width !== height ? ' preserveAspectRatio="xMidYMid meet"' : '';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100"${preserve}>`,
    body,
    `</svg>`,
  ].join('');
}

/**
 * 渲染类 QR 模块矩阵 SVG（不可扫描，仅视觉占位）
 */
export function renderPseudoMatrixSvg(options: PseudoMatrixOptions): string {
  const {
    seed,
    width,
    height = width,
    colors,
    variant = 'matrix',
    radius = 0,
  } = options;
  const dark = resolveMatrixColor(colors?.dark, seed, 'matrix-dark', 22, 16);
  const light = resolveMatrixColor(colors?.light, seed, 'matrix-light', 25, 97);
  const accent = resolveMatrixColor(colors?.accent, seed, 'matrix-accent', 68, 48);
  const parts: string[] = [`<rect width="100" height="100" fill="${light}"/>`];

  if (variant === 'matrix' || variant === 'dots') {
    parts.push(
      renderFinderPattern(0, 0, dark, light),
      renderFinderPattern(MATRIX_SIZE - FINDER, 0, dark, light),
      renderFinderPattern(0, MATRIX_SIZE - FINDER, dark, light),
      renderTimingPatterns(dark, light),
    );
  }

  for (let y = 0; y < MATRIX_SIZE; y += 1) {
    for (let x = 0; x < MATRIX_SIZE; x += 1) {
      if ((variant === 'matrix' || variant === 'dots') && RESERVED[y]![x]) {
        continue;
      }

      if (!isModuleFilled(seed, x, y)) {
        continue;
      }

      const fill = isAccentModule(seed, x, y) ? accent : dark;
      parts.push(renderDataModule(x, y, fill, variant, radius));
    }
  }

  return wrapMatrixSvg(width, height, parts.join(''));
}

/** 矩阵边长（模块数），供测试断言 */
export const PSEUDO_MATRIX_MODULE_COUNT = MATRIX_SIZE;
