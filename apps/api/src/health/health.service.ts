import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { Avatar, Style } from '@dicebear/core';
import { parseRasterDimension } from '../common/utils';
import { verifyPseudoCodeGenerators } from '../common/pseudo-code-verify';
import { loadDicebearStyleDefinition } from '../avatar/styles/registry';

export interface DependencyCheck {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
}

/**
 * 运行时依赖自检（sharp / DiceBear）
 */
@Injectable()
export class HealthService {
  /**
   * 检测 sharp 能否栅格化最小 SVG
   */
  async checkSharp(): Promise<DependencyCheck> {
    try {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#6366f1"/></svg>';
      const buffer = await sharp(Buffer.from(svg, 'utf-8')).png().toBuffer();
      if (buffer.length < 8) {
        return { name: 'sharp', ok: false, detail: 'empty png buffer' };
      }
      return { name: 'sharp', ok: true };
    } catch (err) {
      return {
        name: 'sharp',
        ok: false,
        detail: err instanceof Error ? err.message : 'sharp unavailable',
      };
    }
  }

  /**
   * 检测 DiceBear 风格定义可加载并渲染
   */
  checkDicebear(): DependencyCheck {
    try {
      const definition = loadDicebearStyleDefinition('rings');
      const style = new Style(definition);
      const avatar = new Avatar(style, { seed: 'health', size: 32 });
      const svg = avatar.toString();
      if (!svg.includes('<svg')) {
        return { name: 'dicebear', ok: false, detail: 'invalid svg output' };
      }
      return { name: 'dicebear', ok: true };
    } catch (err) {
      return {
        name: 'dicebear',
        ok: false,
        detail: err instanceof Error ? err.message : 'dicebear unavailable',
      };
    }
  }

  /**
   * 校验栅格尺寸工具链
   */
  checkRasterLimits(): DependencyCheck {
    try {
      parseRasterDimension(128, 'size');
      parseRasterDimension(1024, 'size');
      try {
        parseRasterDimension(1025, 'size');
        return { name: 'raster-limits', ok: false, detail: 'expected rejection for 1025' };
      } catch {
        return { name: 'raster-limits', ok: true };
      }
    } catch (err) {
      return {
        name: 'raster-limits',
        ok: false,
        detail: err instanceof Error ? err.message : 'raster limit check failed',
      };
    }
  }

  /**
   * 检测伪码生成器与 golden 哈希一致
   */
  checkPseudoCode(): DependencyCheck {
    const result = verifyPseudoCodeGenerators();
    if (!result.ok) {
      return { name: 'pseudo-code', ok: false, detail: result.detail };
    }
    return { name: 'pseudo-code', ok: true };
  }

  /**
   * 汇总全部依赖探针
   */
  async runChecks(): Promise<DependencyCheck[]> {
    return Promise.all([
      this.checkSharp(),
      Promise.resolve(this.checkDicebear()),
      Promise.resolve(this.checkRasterLimits()),
      Promise.resolve(this.checkPseudoCode()),
    ]);
  }
}
