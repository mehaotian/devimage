import type { SvgRasterFormat } from '../common/svg-raster';

/** 占位图 query 参数 */
export interface PlaceholderQuery {
  text?: string;
  bg?: string;
  fg?: string;
  format?: string;
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
