import { rasterizeSvg, type SvgRasterFormat } from './svg-raster';
import type { RasterRateLimitService } from './raster-rate-limit.service';
import { parseRasterDimension } from './utils';

/**
 * 共享 SVG 栅格化流程：IP 限流 → 尺寸校验 → Sharp 输出
 */
export async function rasterizeValidatedSvg(
  rasterRateLimit: RasterRateLimitService,
  clientIp: string | undefined,
  width: string | number,
  height: string | number,
  getSvg: () => string,
  format: SvgRasterFormat,
): Promise<Buffer> {
  if (clientIp) {
    rasterRateLimit.assertWithinLimit(clientIp);
  }

  parseRasterDimension(width, 'width');
  parseRasterDimension(height, 'height');

  return rasterizeSvg(getSvg(), format);
}
