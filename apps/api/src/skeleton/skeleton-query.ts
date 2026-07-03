/** 骨架屏 type */
export type SkeletonType = 'page' | 'card' | 'row' | 'grid';

/** 骨架屏 theme */
export type SkeletonTheme = 'light' | 'dark';

const VALID_TYPES: SkeletonType[] = ['page', 'card', 'row', 'grid'];
const VALID_THEMES: SkeletonTheme[] = ['light', 'dark'];

/**
 * 解析骨架屏 type query
 */
export function parseSkeletonType(value?: string): SkeletonType {
  if (!value || value === '') {
    return 'page';
  }
  const normalized = value.toLowerCase();
  if (VALID_TYPES.includes(normalized as SkeletonType)) {
    return normalized as SkeletonType;
  }
  throw new Error(`Invalid type. Use: ${VALID_TYPES.join(', ')}`);
}

/**
 * 解析骨架屏 theme query
 */
export function parseSkeletonTheme(value?: string): SkeletonTheme {
  if (!value || value === '') {
    return 'light';
  }
  const normalized = value.toLowerCase();
  if (VALID_THEMES.includes(normalized as SkeletonTheme)) {
    return normalized as SkeletonTheme;
  }
  throw new Error(`Invalid theme. Use: ${VALID_THEMES.join(', ')}`);
}

/**
 * 解析 grid 列数（1–6）
 */
export function parseSkeletonCols(value?: string): number {
  if (!value || value === '') {
    return 3;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1 || num > 6) {
    throw new Error('Invalid cols: must be between 1 and 6');
  }
  return num;
}

/**
 * 解析 animate query（一期仅支持 0/1，1 时输出静态 shimmer 渐变）
 */
export function parseSkeletonAnimate(value?: string): boolean {
  if (!value || value === '' || value === '0' || value === 'false') {
    return false;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  throw new Error('Invalid animate: use 0 or 1');
}
