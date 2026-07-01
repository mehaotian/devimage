import { Injectable } from '@nestjs/common';
import { escapeSvgText, parseDimension, seedToHue, hslToHex } from '../common/utils';

export interface AvatarOptions {
  name: string;
  size: number;
  bg?: string;
  fg?: string;
}

/**
 * 字母/中文首字头像 SVG 生成服务
 */
@Injectable()
export class AvatarService {
  /**
   * 提取显示字符（中文取首字，英文取首字母）
   */
  extractInitial(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      return '?';
    }
    const first = [...trimmed][0] ?? '?';
    if (/[\u4e00-\u9fff]/.test(first)) {
      return first;
    }
    return first.toUpperCase();
  }

  /**
   * 渲染圆形字母头像 SVG
   */
  renderSvg(options: AvatarOptions): string {
    const size = parseDimension(options.size, 'size');
    const initial = escapeSvgText(this.extractInitial(options.name), 2);
    const hue = seedToHue(options.name);
    const bg = options.bg ?? hslToHex(hue, 55, 55);
    const fg = options.fg ?? 'ffffff';
    const fontSize = Math.floor(size * 0.45);
    const r = size / 2;

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
      `<circle cx="${r}" cy="${r}" r="${r}" fill="#${bg.replace(/^#/, '')}"/>`,
      `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"`,
      ` fill="#${fg.replace(/^#/, '')}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${initial}</text>`,
      `</svg>`,
    ].join('');
  }
}
