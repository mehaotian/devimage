import { Injectable } from '@nestjs/common';
import {
  getAvatarEngine,
  getAvatarStyleMeta,
  isKnownAvatarStyle,
  listAvatarStyles,
} from './styles/registry';
import type { AvatarStyleMeta } from './styles/types';
import { DicebearAvatarService } from './dicebear-avatar.service';
import { NativeAvatarService } from './native-avatar.service';

export interface StyledAvatarRenderOptions {
  style: string;
  seed: string;
  size: number;
  bg?: string;
  fg?: string;
}

/**
 * 统一头像风格调度：native / partner 多引擎路由
 */
@Injectable()
export class AvatarStyleService {
  constructor(
    private readonly nativeAvatarService: NativeAvatarService,
    private readonly dicebearAvatarService: DicebearAvatarService,
  ) {}

  /**
   * 返回全部已注册风格（含 engine 字段）
   */
  listStyles(): AvatarStyleMeta[] {
    return listAvatarStyles();
  }

  /**
   * 判断 style 是否已注册
   */
  isKnownStyle(style: string): boolean {
    return isKnownAvatarStyle(style);
  }

  /**
   * 按 engine 渲染 SVG
   */
  renderSvg(options: StyledAvatarRenderOptions): string {
    const engine = getAvatarEngine(options.style);
    if (!engine) {
      throw new Error(`Unknown avatar style: ${options.style}`);
    }

    switch (engine) {
      case 'native':
        return this.nativeAvatarService.renderSvg({
          style: options.style,
          seed: options.seed,
          size: options.size,
          bg: options.bg,
          fg: options.fg,
        });
      case 'partner':
        return this.dicebearAvatarService.renderSvg({
          style: options.style,
          seed: options.seed,
          size: options.size,
        });
      default:
        throw new Error(`Style engine not implemented: ${engine}`);
    }
  }

  /**
   * 获取单个风格元数据
   */
  getStyleMeta(style: string): AvatarStyleMeta | undefined {
    return getAvatarStyleMeta(style);
  }
}
