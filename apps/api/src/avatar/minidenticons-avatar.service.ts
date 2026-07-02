import { Injectable } from '@nestjs/common';
import { parseDimension } from '../common/utils';

export interface MinidenticonsAvatarOptions {
  seed: string;
  size: number;
}

/**
 * 基于 Minidenticons（MIT）的极简像素 identicon 渲染
 */
@Injectable()
export class MinidenticonsAvatarService {
  /**
   * 渲染 seed 对应的 Minidenticon SVG，并补齐 width/height
   */
  renderSvg(options: MinidenticonsAvatarOptions): string {
    const size = parseDimension(options.size, 'size');
    const { minidenticon } = require('minidenticons') as {
      minidenticon: (seed: string) => string;
    };
    const raw = minidenticon(options.seed);
    if (/^<svg[^>]*\swidth=/i.test(raw)) {
      return raw;
    }
    return raw.replace(/^<svg\b/, `<svg width="${size}" height="${size}"`);
  }
}
