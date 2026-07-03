import type { SvgRasterFormat } from '../common/svg-raster';

/** placehold 风格尺寸解析结果 */
export interface DimSpecParsed {
  width: number;
  height: number;
  format: SvgRasterFormat | null;
}

const DIM_SPEC_RE = /^(\d+)x(\d+)(?:\.(svg|webp|png))?$/i;

/**
 * 解析 `800x600` / `800x600.svg` 尺寸规格
 */
export function parseDimSpec(spec: string): DimSpecParsed {
  const match = DIM_SPEC_RE.exec(spec.trim());
  if (!match) {
    throw new Error(`Invalid dimensions: use {width}x{height}, e.g. 800x600`);
  }

  const width = Number.parseInt(match[1]!, 10);
  const height = Number.parseInt(match[2]!, 10);
  if (width < 10 || width > 4000 || height < 10 || height > 4000) {
    throw new Error('Invalid dimensions: width and height must be between 10 and 4000');
  }

  const ext = match[3]?.toLowerCase();
  let format: SvgRasterFormat | null = null;
  if (ext === 'webp' || ext === 'png') {
    format = ext;
  }

  return { width, height, format };
}

/**
 * 判断 path 段是否为 placehold 风格尺寸（含可选后缀）
 */
export function isDimSpecSegment(segment: string): boolean {
  return DIM_SPEC_RE.test(segment.trim());
}
