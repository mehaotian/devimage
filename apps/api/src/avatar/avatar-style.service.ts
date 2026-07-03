import { Injectable } from '@nestjs/common';
import {
  getAvatarEngine,
  getAvatarProvider,
  getAvatarStyleMeta,
  isKnownAvatarStyle,
  listAvatarStyles,
} from './styles/registry';
import type { AvatarStyleMeta } from './styles/types';
import { DicebearAvatarService } from './dicebear-avatar.service';
import { JdenticonAvatarService } from './jdenticon-avatar.service';
import { MinidenticonsAvatarService } from './minidenticons-avatar.service';
import { NativeAvatarService } from './native-avatar.service';
import { buildPatternCatalog } from './devimg-patterns/index';

export interface StyledAvatarRenderOptions {
  style: string;
  seed: string;
  size: number;
  variant?: string;
  text?: string;
  shape?: string;
  bg?: string;
  fg?: string;
  pattern?: string;
  /** 栅格化请求（应用更严格的尺寸上限） */
  raster?: boolean;
}

/**
 * 统一头像风格调度：native / partner 多引擎路由
 */
@Injectable()
export class AvatarStyleService {
  constructor(
    private readonly nativeAvatarService: NativeAvatarService,
    private readonly dicebearAvatarService: DicebearAvatarService,
    private readonly jdenticonAvatarService: JdenticonAvatarService,
    private readonly minidenticonsAvatarService: MinidenticonsAvatarService,
  ) {}

  /**
   * 返回全部已注册风格（含 engine 字段）
   */
  listStyles(): AvatarStyleMeta[] {
    return listAvatarStyles();
  }

  /**
   * 返回 devimg 纹理 pattern 分组目录
   */
  listPatterns() {
    return buildPatternCatalog();
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
          variant: options.variant,
          text: options.text,
          shape: options.shape,
          bg: options.bg,
          fg: options.fg,
          pattern: options.pattern,
        });
      case 'partner':
        return this.renderPartnerSvg(options);
      default:
        throw new Error(`Style engine not implemented: ${engine}`);
    }
  }

  /**
   * 按 provider 调度 partner 引擎
   */
  private renderPartnerSvg(options: StyledAvatarRenderOptions): string {
    const provider = getAvatarProvider(options.style);
    switch (provider) {
      case 'dicebear':
        return this.dicebearAvatarService.renderSvg({
          style: options.style,
          seed: options.seed,
          size: options.size,
        });
      case 'jdenticon':
        return this.jdenticonAvatarService.renderSvg({
          seed: options.seed,
          size: options.size,
        });
      case 'minidenticons':
        return this.minidenticonsAvatarService.renderSvg({
          seed: options.seed,
          size: options.size,
        });
      default:
        throw new Error(`Partner provider not implemented: ${provider ?? options.style}`);
    }
  }

  /**
   * 获取单个风格元数据
   */
  getStyleMeta(style: string): AvatarStyleMeta | undefined {
    return getAvatarStyleMeta(style);
  }
}
