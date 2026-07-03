import { Injectable } from '@nestjs/common';
import {
  renderDevimgPattern,
  isDevimgPatternId,
} from '../avatar/devimg-patterns/index';
import {
  escapeSvgText,
  hslToHex,
  parseHexColor,
  parseDimension,
  seedToHue,
} from '../common/utils';

export interface PlaceholderOptions {
  width: number;
  height: number;
  text?: string;
  bg?: string;
  fg?: string;
  seed?: string;
  borderWidth?: number;
  borderColor?: string;
  cross?: boolean;
  style?: 'solid' | 'pattern';
  pattern?: string;
}

/**
 * 合成占位图 SVG 生成服务
 */
@Injectable()
export class PlaceholderService {
  /**
   * 解析并校验占位图参数
   */
  resolveOptions(
    w: string,
    h: string,
    query: {
      text?: string;
      bg?: string;
      fg?: string;
      borderWidth?: number;
      borderColor?: string;
      cross?: boolean;
      style?: 'solid' | 'pattern';
      pattern?: string;
    },
    seed?: string,
  ): PlaceholderOptions {
    const width = parseDimension(w, 'width');
    const height = parseDimension(h, 'height');
    const hue = seed ? seedToHue(seed) : Math.floor(Math.random() * 360);
    const defaultBg = seed ? hslToHex(hue, 45, 75) : 'cccccc';
    const defaultFg = seed ? hslToHex(hue, 50, 30) : '666666';

    return {
      width,
      height,
      text: query.text ?? `${width}×${height}`,
      bg: parseHexColor(query.bg, defaultBg),
      fg: parseHexColor(query.fg, defaultFg),
      seed,
      borderWidth: query.borderWidth ?? 0,
      borderColor: query.borderColor
        ? parseHexColor(query.borderColor, '000000')
        : '000000',
      cross: query.cross ?? false,
      style: query.style ?? 'solid',
      pattern: query.pattern,
    };
  }

  /**
   * 渲染 SVG 占位图字符串
   */
  renderSvg(options: PlaceholderOptions): string {
    const {
      width,
      height,
      text,
      bg,
      fg,
      seed,
      borderWidth = 0,
      borderColor = '000000',
      cross,
      style,
      pattern,
    } = options;

    const fontSize = Math.max(12, Math.floor(Math.min(width, height) * 0.12));
    const safeText = escapeSvgText(text ?? `${width}×${height}`);
    const patternSeed = seed ?? `${width}x${height}`;

    const background =
      style === 'pattern'
        ? this.buildPatternBackground(patternSeed, pattern, bg ?? 'cccccc', width, height)
        : { defs: '', body: `<rect width="100%" height="100%" fill="#${bg}"/>` };

    const borderLayer =
      borderWidth > 0
        ? [
            `<rect x="${borderWidth / 2}" y="${borderWidth / 2}"`,
            ` width="${width - borderWidth}" height="${height - borderWidth}"`,
            ` fill="none" stroke="#${borderColor}" stroke-width="${borderWidth}"/>`,
          ].join('')
        : '';

    const crossLayer = cross
      ? [
          `<line x1="0" y1="0" x2="${width}" y2="${height}"`,
          ` stroke="#${fg}" stroke-width="1" opacity="0.35"/>`,
          `<line x1="${width}" y1="0" x2="0" y2="${height}"`,
          ` stroke="#${fg}" stroke-width="1" opacity="0.35"/>`,
        ].join('')
      : '';

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"`,
      ` viewBox="0 0 ${width} ${height}">`,
      background.defs,
      background.body,
      crossLayer,
      borderLayer,
      `<text x="50%" y="50%" text-anchor="middle" dy="0.35em"`,
      ` fill="#${fg}" font-family="system-ui,sans-serif" font-size="${fontSize}">${safeText}</text>`,
      `</svg>`,
    ].join('');
  }

  /**
   * 构建 pattern 纹理背景（100×100 坐标系缩放至画布）
   */
  private buildPatternBackground(
    seed: string,
    patternOverride: string | undefined,
    solidBg: string,
    width: number,
    height: number,
  ): { defs: string; body: string } {
    const override =
      patternOverride && isDevimgPatternId(patternOverride)
        ? patternOverride
        : undefined;

    if (patternOverride && !override) {
      return { defs: '', body: `<rect width="100%" height="100%" fill="#${solidBg}"/>` };
    }

    const { defs, body } = renderDevimgPattern(seed, override);
    const sx = width / 100;
    const sy = height / 100;

    return {
      defs,
      body: `<g transform="scale(${sx}, ${sy})">${body}</g>`,
    };
  }
}
