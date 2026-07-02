import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  AvatarStyleService,
  type StyledAvatarRenderOptions,
} from './avatar-style.service';

export type AvatarRasterFormat = 'png' | 'webp';

/**
 * 头像 SVG 栅格化：输出 PNG / WebP，供小程序等不支持 SVG 的场景使用
 */
@Injectable()
export class AvatarRasterService {
  constructor(private readonly avatarStyleService: AvatarStyleService) {}

  /**
   * 将 seed 头像 SVG 栅格化为 PNG 或 WebP
   */
  async renderRaster(
    options: StyledAvatarRenderOptions,
    format: AvatarRasterFormat,
  ): Promise<Buffer> {
    const svg = this.avatarStyleService.renderSvg(options);
    const pipeline = sharp(Buffer.from(svg, 'utf-8'));

    if (format === 'png') {
      return pipeline.png({ compressionLevel: 9 }).toBuffer();
    }

    return pipeline.webp({ quality: 80 }).toBuffer();
  }
}
