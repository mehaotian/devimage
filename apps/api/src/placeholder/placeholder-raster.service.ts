import { Injectable } from '@nestjs/common';
import { rasterizeSvg, type SvgRasterFormat } from '../common/svg-raster';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';
import { parseRasterDimension } from '../common/utils';
import { PlaceholderService, type PlaceholderOptions } from './placeholder.service';

/**
 * 占位图 SVG 栅格化（WebP / PNG）
 */
@Injectable()
export class PlaceholderRasterService {
  constructor(
    private readonly placeholderService: PlaceholderService,
    private readonly rasterRateLimit: RasterRateLimitService,
  ) {}

  /**
   * 渲染栅格化占位图
   */
  async renderRaster(
    options: PlaceholderOptions,
    format: SvgRasterFormat,
    clientIp?: string,
  ): Promise<Buffer> {
    if (clientIp) {
      this.rasterRateLimit.assertWithinLimit(clientIp);
    }

    parseRasterDimension(options.width, 'width');
    parseRasterDimension(options.height, 'height');

    const svg = this.placeholderService.renderSvg(options);
    return rasterizeSvg(svg, format);
  }
}
