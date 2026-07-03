import { Injectable } from '@nestjs/common';
import { rasterizeValidatedSvg } from '../common/svg-raster-route';
import type { SvgRasterFormat } from '../common/svg-raster';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';

/**
 * 码形占位 SVG 栅格化（WebP / PNG），供伪 QR 与伪条码共用
 */
@Injectable()
export class PseudoCodeRasterService {
  constructor(private readonly rasterRateLimit: RasterRateLimitService) {}

  /**
   * 将 SVG 字符串栅格化为 PNG 或 WebP
   */
  async renderFromSvg(
    clientIp: string | undefined,
    width: string | number,
    height: string | number,
    getSvg: () => string,
    format: SvgRasterFormat,
  ): Promise<Buffer> {
    return rasterizeValidatedSvg(
      this.rasterRateLimit,
      clientIp,
      width,
      height,
      getSvg,
      format,
    );
  }
}
