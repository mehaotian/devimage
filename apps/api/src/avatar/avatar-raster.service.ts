import { Injectable } from '@nestjs/common';
import { rasterizeSvg, type SvgRasterFormat } from '../common/svg-raster';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';
import { parseDimension, parseRasterDimension } from '../common/utils';
import {
  AvatarStyleService,
  type StyledAvatarRenderOptions,
} from './avatar-style.service';

export type AvatarRasterFormat = SvgRasterFormat;

/**
 * 头像 SVG 栅格化：输出 PNG / WebP，供小程序等不支持 SVG 的场景使用
 */
@Injectable()
export class AvatarRasterService {
  constructor(
    private readonly avatarStyleService: AvatarStyleService,
    private readonly rasterRateLimit: RasterRateLimitService,
  ) {}

  /**
   * 将 seed 头像 SVG 栅格化为 PNG 或 WebP
   */
  async renderRaster(
    options: StyledAvatarRenderOptions,
    format: AvatarRasterFormat,
    clientIp?: string,
  ): Promise<Buffer> {
    if (clientIp) {
      this.rasterRateLimit.assertWithinLimit(clientIp);
    }

    const size = options.raster
      ? parseRasterDimension(options.size, 'size')
      : parseDimension(options.size, 'size');
    const renderOptions = { ...options, size };
    const svg = this.avatarStyleService.renderSvg(renderOptions);
    return rasterizeSvg(svg, format);
  }
}
