import { Injectable } from '@nestjs/common';
import {
  escapeSvgText,
  hslToHex,
  parseDimension,
  parseHexColor,
  seedToHue,
} from '../common/utils';

export interface PlaceholderOptions {
  width: number;
  height: number;
  text?: string;
  bg?: string;
  fg?: string;
  seed?: string;
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
    query: { text?: string; bg?: string; fg?: string },
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
    };
  }

  /**
   * 渲染 SVG 占位图字符串
   */
  renderSvg(options: PlaceholderOptions): string {
    const { width, height, text, bg, fg } = options;
    const fontSize = Math.max(12, Math.floor(Math.min(width, height) * 0.12));
    const safeText = escapeSvgText(text ?? `${width}×${height}`);

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect width="100%" height="100%" fill="#${bg}"/>`,
      `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"`,
      ` fill="#${fg}" font-family="system-ui,sans-serif" font-size="${fontSize}">${safeText}</text>`,
      `</svg>`,
    ].join('');
  }
}
