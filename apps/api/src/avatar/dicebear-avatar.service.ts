import { Injectable } from '@nestjs/common';
import { Avatar, Style } from '@dicebear/core';
import { parseDimension } from '../common/utils';
import { isPartnerStyle, loadDicebearStyleDefinition } from './styles/registry';

export interface StyledAvatarOptions {
  style: string;
  seed: string;
  size: number;
}

/**
 * 基于 DiceBear 开源 SDK 的 partner 头像渲染
 */
@Injectable()
export class DicebearAvatarService {
  private readonly styleCache = new Map<string, Style>();

  /**
   * 判断 style 是否为 partner（DiceBear）
   */
  isKnownStyle(style: string): boolean {
    return isPartnerStyle(style);
  }

  /**
   * 获取或创建缓存的 Style 实例
   */
  private resolveStyle(styleId: string): Style {
    const cached = this.styleCache.get(styleId);
    if (cached) {
      return cached;
    }

    const definition = loadDicebearStyleDefinition(styleId);
    const style = new Style(definition);
    this.styleCache.set(styleId, style);
    return style;
  }

  /**
   * 渲染指定 partner style + seed 的 SVG 头像
   */
  renderSvg(options: StyledAvatarOptions): string {
    const size = parseDimension(options.size, 'size');
    const style = this.resolveStyle(options.style);
    const avatar = new Avatar(style, {
      seed: options.seed,
      size,
    });
    return avatar.toString();
  }
}
