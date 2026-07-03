import type { SvgRasterFormat } from '../common/svg-raster';

/** 占位图 query 参数（含兼容别名） */
export interface PlaceholderQuery {
  text?: string;
  bg?: string;
  fg?: string;
  format?: string;
  border?: string;
  borderColor?: string;
  cross?: string;
  style?: string;
  pattern?: string;
  bc?: string;
  tc?: string;
  t?: string;
  width?: string;
  height?: string;
}

/** 规范化后的占位图 query */
export interface NormalizedPlaceholderQuery {
  text?: string;
  bg?: string;
  fg?: string;
  format?: string;
  border?: string;
  borderColor?: string;
  cross?: string;
  style?: string;
  pattern?: string;
}

/**
 * 合并 query 别名（bc/tc/t、width/height 仅文档用途不在此路由用）
 */
export function normalizePlaceholderQuery(query: PlaceholderQuery): NormalizedPlaceholderQuery {
  return {
    text: query.text ?? query.t,
    bg: query.bg ?? query.bc,
    fg: query.fg ?? query.tc,
    format: query.format,
    border: query.border,
    borderColor: query.borderColor,
    cross: query.cross,
    style: query.style,
    pattern: query.pattern,
  };
}

/**
 * 解析 ?format= 栅格格式
 */
export function parsePlaceholderRasterFormat(format?: string): SvgRasterFormat | null {
  if (!format) {
    return null;
  }

  const normalized = format.toLowerCase();
  if (normalized === 'svg') {
    return null;
  }
  if (normalized === 'webp' || normalized === 'png') {
    return normalized;
  }

  return null;
}

/**
 * 解析 border 宽度（0–20 px）
 */
export function parseBorderWidth(value?: string): number {
  if (!value || value === '' || value === '0' || value === 'false') {
    return 0;
  }
  if (value === '1' || value === 'true') {
    return 2;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 0 || num > 20) {
    throw new Error('Invalid border: must be between 0 and 20');
  }
  return num;
}

/**
 * 解析 cross 标记
 */
export function parseCrossFlag(value?: string): boolean {
  if (!value || value === '' || value === '0' || value === 'false') {
    return false;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  throw new Error('Invalid cross: use 0 or 1');
}

/**
 * 解析 style（solid | pattern）
 */
export function parsePlaceholderStyle(value?: string): 'solid' | 'pattern' {
  if (!value || value === '' || value === 'solid') {
    return 'solid';
  }
  if (value === 'pattern') {
    return 'pattern';
  }
  throw new Error('Invalid style: use solid or pattern');
}

/** 解析后的占位图 query 字段 */
export interface ResolvedPlaceholderFields {
  text?: string;
  bg?: string;
  fg?: string;
  borderWidth: number;
  borderColor?: string;
  cross: boolean;
  style: 'solid' | 'pattern';
  pattern?: string;
}

/**
 * 将规范化 query 与可选 path 配色合并为 service 入参
 */
export function resolvePlaceholderFields(
  query: NormalizedPlaceholderQuery,
  pathBg?: string,
  pathFg?: string,
): ResolvedPlaceholderFields {
  return {
    text: query.text,
    bg: pathBg ?? query.bg,
    fg: pathFg ?? query.fg,
    borderWidth: parseBorderWidth(query.border),
    borderColor: query.borderColor,
    cross: parseCrossFlag(query.cross),
    style: parsePlaceholderStyle(query.style),
    pattern: query.pattern,
  };
}
