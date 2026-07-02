import { Injectable } from '@nestjs/common';
import { toSvg } from 'jdenticon';
import { parseDimension } from '../common/utils';

export interface JdenticonAvatarOptions {
  seed: string;
  size: number;
}

/**
 * 基于 Jdenticon（MIT）的几何 identicon 渲染
 */
@Injectable()
export class JdenticonAvatarService {
  /**
   * 渲染 seed 对应的 Jdenticon SVG
   */
  renderSvg(options: JdenticonAvatarOptions): string {
    const size = parseDimension(options.size, 'size');
    return toSvg(options.seed, size);
  }
}
