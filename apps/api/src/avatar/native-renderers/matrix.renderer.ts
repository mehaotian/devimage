import { fnv1a32 } from '../../common/seed';
import { type NativeRendererInput, seedColor, wrapSvg } from './helpers';

const MATRIX_SIZE = 21;
const MODULE = 100 / MATRIX_SIZE;
const FINDER = 7;

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
 * 渲染类 QR 模块矩阵头像（不可扫描，仅视觉）
 */
export function renderMatrix(input: NativeRendererInput): string {
  const { seed, size } = input;
  const dark = seedColor(seed, 'matrix-dark', 22, 16);
  const light = seedColor(seed, 'matrix-light', 25, 97);
  const accent = seedColor(seed, 'matrix-accent', 68, 48);
  const parts: string[] = [
    `<rect width="100" height="100" fill="${light}"/>`,
    renderFinderPattern(0, 0, dark, light),
    renderFinderPattern(MATRIX_SIZE - FINDER, 0, dark, light),
    renderFinderPattern(0, MATRIX_SIZE - FINDER, dark, light),
    renderTimingPatterns(dark, light),
  ];

  for (let y = 0; y < MATRIX_SIZE; y += 1) {
    for (let x = 0; x < MATRIX_SIZE; x += 1) {
      if (RESERVED[y]![x]) {
        continue;
      }

      if (!isModuleFilled(seed, x, y)) {
        continue;
      }

      const fill = isAccentModule(seed, x, y) ? accent : dark;
      parts.push(
        `<rect x="${(x * MODULE).toFixed(3)}" y="${(y * MODULE).toFixed(3)}" width="${MODULE.toFixed(3)}" height="${MODULE.toFixed(3)}" fill="${fill}"/>`,
      );
    }
  }

  return wrapSvg(size, parts.join(''));
}
