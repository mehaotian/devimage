import { Injectable } from '@nestjs/common';
import {
  escapeSvgText,
  hslToHex,
  parseDimension,
  parseHexColor,
} from '../common/utils';
import { extractInitialChar } from '../common/text';
import {
  buildGradientColors,
  buildRainbowMeshBlobs,
} from './devimg-palette';
import {
  DEVIMG_PATTERN_IDS,
  isDevimgPatternId,
  renderDevimgPattern,
} from './devimg-patterns/index';
import { isExperimentalNativeStyle, renderExperimentalNative } from './native-renderers/index';
import { renderGeo } from './native-renderers/geo.renderer';

/** devimg 背景变体 */
export type DevimgVariant = 'gradient' | 'mesh' | 'pattern';

/** devimg 裁剪形状 */
export type DevimgShape = 'circle' | 'square';

export interface NativeAvatarOptions {
  style: string;
  seed: string;
  size: number;
  variant?: string;
  text?: string;
  shape?: string;
  bg?: string;
  fg?: string;
  pattern?: string;
}

interface DevimgRenderConfig {
  seed: string;
  size: number;
  variant: DevimgVariant;
  showText: boolean;
  shape: DevimgShape;
  bg?: string;
  fg?: string;
  pattern?: string;
}

/**
 * DevImage 自研 native 头像 SVG 渲染
 */
@Injectable()
export class NativeAvatarService {
  /**
   * 渲染指定 native style 的 SVG
   */
  renderSvg(options: NativeAvatarOptions): string {
    const size = parseDimension(options.size, 'size');

    if (options.style === 'devimg-geo') {
      return renderGeo({ seed: options.seed, size });
    }

    if (isExperimentalNativeStyle(options.style)) {
      return renderExperimentalNative(options.style, options.seed, size);
    }

    if (this.isDevimgFamily(options.style)) {
      const config = this.resolveDevimgConfig(options);
      return this.renderDevimg(config);
    }

    throw new Error(`Unknown native style: ${options.style}`);
  }

  /**
   * 判断是否为 devimg 统一头像族（含历史别名 style）
   */
  private isDevimgFamily(style: string): boolean {
    return (
      style === 'devimg' ||
      style === 'devimg-gradient' ||
      style === 'devimg-mesh' ||
      style === 'devimg-initials' ||
      style === 'devimg-pattern'
    );
  }

  /**
   * 将 style 别名与 query 解析为统一 devimg 配置
   */
  private resolveDevimgConfig(options: NativeAvatarOptions): DevimgRenderConfig {
    const size = parseDimension(options.size, 'size');
    let variant = options.variant;
    let text = options.text;

    switch (options.style) {
      case 'devimg-gradient':
        variant = variant ?? 'gradient';
        text = text ?? '0';
        break;
      case 'devimg-mesh':
        variant = variant ?? 'mesh';
        text = text ?? '0';
        break;
      case 'devimg-initials':
        variant = variant ?? 'gradient';
        text = text ?? '1';
        break;
      case 'devimg-pattern':
        variant = variant ?? 'pattern';
        text = text ?? '0';
        break;
      case 'devimg':
      default:
        variant = variant ?? 'gradient';
        text = text ?? '1';
        break;
    }

    if (variant !== 'gradient' && variant !== 'mesh' && variant !== 'pattern') {
      throw new Error(`Invalid variant: ${variant}. Use gradient, mesh or pattern.`);
    }

    if (options.pattern && !isDevimgPatternId(options.pattern)) {
      throw new Error(`Invalid pattern: ${options.pattern}. Use ${DEVIMG_PATTERN_IDS.join(', ')}.`);
    }

    if (variant === 'pattern' && options.bg) {
      throw new Error('bg is not supported with pattern variant. Pattern colors are derived from seed.');
    }

    if (text !== '0' && text !== '1') {
      throw new Error(`Invalid text: ${text}. Use 0 or 1.`);
    }

    const shape = options.shape ?? 'circle';
    if (shape !== 'circle' && shape !== 'square') {
      throw new Error(`Invalid shape: ${shape}. Use circle or square.`);
    }

    return {
      seed: options.seed,
      size,
      variant,
      showText: text === '1',
      shape,
      bg: options.bg,
      fg: options.fg,
      pattern: options.pattern,
    };
  }

  /**
   * 生成 devimg 裁剪 defs（方形时不裁剪）
   */
  private buildShapeClipDef(shape: DevimgShape): string {
    if (shape === 'square') {
      return '';
    }
    return `<defs><clipPath id="clip"><circle cx="50" cy="50" r="50"/></clipPath></defs>`;
  }

  /**
   * 按形状包裹背景层
   */
  private wrapShapeContent(body: string, shape: DevimgShape): string {
    if (shape === 'square') {
      return body;
    }
    return `<g clip-path="url(#clip)">${body}</g>`;
  }

  /**
   * 统一 devimg 渲染：背景 variant + 可选首字 overlay
   */
  private renderDevimg(config: DevimgRenderConfig): string {
    const { seed, size, variant, showText, shape, bg, fg, pattern } = config;
    const solidBg = bg ? `#${parseHexColor(bg, '000000')}` : undefined;
    const background =
      variant === 'mesh'
        ? this.buildMeshLayers(seed, solidBg)
        : variant === 'pattern'
          ? this.buildPatternLayers(seed, solidBg, pattern)
          : this.buildGradientLayers(seed, solidBg);

    const textLayer = showText ? this.buildInitialTextLayer(seed, fg) : '';
    const clipDef = this.buildShapeClipDef(shape);
    const body = this.wrapShapeContent(background.body, shape);

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">`,
      background.defs,
      clipDef,
      body,
      textLayer,
      `</svg>`,
    ].join('');
  }

  /**
   * 构建渐变背景层（双色线性渐变 + 同色系径向高光）
   */
  private buildGradientLayers(
    seed: string,
    solidBg?: string,
  ): { defs: string; body: string } {
    if (solidBg) {
      return {
        defs: '',
        body: `<rect width="100" height="100" fill="${solidBg}"/>`,
      };
    }

    const { c1, c2, c3, angle, fx, fy } = buildGradientColors(seed);

    return {
      defs: [
        `<defs>`,
        `<linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100" gradientTransform="rotate(${angle} 50 50)">`,
        `<stop offset="0%" stop-color="#${c1}"/>`,
        `<stop offset="100%" stop-color="#${c2}"/>`,
        `</linearGradient>`,
        `<radialGradient id="rg" gradientUnits="userSpaceOnUse" cx="${fx}" cy="${fy}" r="55" fx="${fx}" fy="${fy}">`,
        `<stop offset="0%" stop-color="#${c3}" stop-opacity="0.75"/>`,
        `<stop offset="100%" stop-color="#${c2}" stop-opacity="0"/>`,
        `</radialGradient>`,
        `</defs>`,
      ].join(''),
      body: [
        `<rect width="100" height="100" fill="url(#lg)"/>`,
        `<rect width="100" height="100" fill="url(#rg)"/>`,
      ].join(''),
    };
  }

  /**
   * 构建 CSS 纹理 pattern 背景层（seed 选模板 + 配色）
   */
  private buildPatternLayers(
    seed: string,
    solidBg?: string,
    patternOverride?: string,
  ): { defs: string; body: string } {
    if (solidBg) {
      return {
        defs: '',
        body: `<rect width="100" height="100" fill="${solidBg}"/>`,
      };
    }

    return renderDevimgPattern(seed, patternOverride);
  }

  /**
   * 构建 mesh 背景层（彩虹四色光斑 + 浅色底）
   */
  private buildMeshLayers(
    seed: string,
    solidBg?: string,
  ): { defs: string; body: string } {
    if (solidBg) {
      return {
        defs: '',
        body: `<rect width="100" height="100" fill="${solidBg}"/>`,
      };
    }

    const { background, blobs } = buildRainbowMeshBlobs(seed);
    const gradientDefs: string[] = [];
    const layers: string[] = [];

    blobs.forEach((blob, i) => {
      const gradId = `mesh-${i}`;
      gradientDefs.push(
        `<radialGradient id="${gradId}" gradientUnits="userSpaceOnUse" cx="${blob.cx.toFixed(1)}" cy="${blob.cy.toFixed(1)}" r="${blob.radius}" fx="${blob.cx.toFixed(1)}" fy="${blob.cy.toFixed(1)}">`,
        `<stop offset="0%" stop-color="#${blob.color}"/>`,
        `<stop offset="100%" stop-color="#${blob.color}" stop-opacity="0"/>`,
        `</radialGradient>`,
      );
      layers.push(`<rect width="100" height="100" fill="url(#${gradId})"/>`);
    });

    return {
      defs: [`<defs>`, gradientDefs.join(''), `</defs>`].join(''),
      body: [`<rect width="100" height="100" fill="#${background}"/>`, layers.join('')].join(''),
    };
  }

  /**
   * 构建首字文字层（viewBox 100×100 坐标系）
   * 使用 dy 而非 dominant-baseline：librsvg（sharp 栅格化）不支持 central，会导致 PNG/WebP 文字上移
   */
  private buildInitialTextLayer(seed: string, fg?: string): string {
    const initial = escapeSvgText(extractInitialChar(seed), 2);
    const foreground = `#${parseHexColor(fg, 'ffffff')}`;

    return [
      `<text x="50" y="50" text-anchor="middle" dy="0.35em"`,
      ` fill="${foreground}" font-family="system-ui,sans-serif" font-size="42" font-weight="600">${initial}</text>`,
    ].join('');
  }
}
