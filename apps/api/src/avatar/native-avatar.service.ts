import { Injectable } from '@nestjs/common';
import {
  escapeSvgText,
  hslToHex,
  parseDimension,
  parseHexColor,
  seedToHue,
} from '../common/utils';
import { seedToInt, seedToUnit } from '../common/seed';

export interface NativeAvatarOptions {
  style: string;
  seed: string;
  size: number;
  bg?: string;
  fg?: string;
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
    switch (options.style) {
      case 'devimg-gradient':
        return this.renderGradient(options.seed, size);
      case 'devimg-mesh':
        return this.renderMesh(options.seed, size);
      case 'devimg-geo':
        return this.renderGeo(options.seed, size);
      case 'devimg-initials':
        return this.renderInitials(options.seed, size, options.bg, options.fg);
      default:
        throw new Error(`Unknown native style: ${options.style}`);
    }
  }

  /**
   * 渐变圆：圆形裁剪 + 线性/径向渐变叠加
   */
  private renderGradient(seed: string, size: number): string {
    const h1 = seedToInt(seed, 'h1', 0, 360);
    const h2 = (h1 + seedToInt(seed, 'h2', 40, 160)) % 360;
    const c1 = `#${hslToHex(h1, 68, 58)}`;
    const c2 = `#${hslToHex(h2, 72, 48)}`;
    const c3 = `#${hslToHex((h1 + 180) % 360, 55, 72)}`;
    const angle = seedToInt(seed, 'angle', 0, 360);
    const fx = (seedToUnit(seed, 'cx') * 30 + 35).toFixed(1);
    const fy = (seedToUnit(seed, 'cy') * 30 + 35).toFixed(1);

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">`,
      `<defs>`,
      `<clipPath id="clip"><circle cx="50" cy="50" r="50"/></clipPath>`,
      `<linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100" gradientTransform="rotate(${angle} 50 50)">`,
      `<stop offset="0%" stop-color="${c1}"/>`,
      `<stop offset="100%" stop-color="${c2}"/>`,
      `</linearGradient>`,
      `<radialGradient id="rg" gradientUnits="userSpaceOnUse" cx="${fx}" cy="${fy}" r="55" fx="${fx}" fy="${fy}">`,
      `<stop offset="0%" stop-color="${c3}" stop-opacity="0.95"/>`,
      `<stop offset="100%" stop-color="${c2}" stop-opacity="0"/>`,
      `</radialGradient>`,
      `</defs>`,
      `<g clip-path="url(#clip)">`,
      `<rect width="100" height="100" fill="url(#lg)"/>`,
      `<rect width="100" height="100" fill="url(#rg)"/>`,
      `</g>`,
      `</svg>`,
    ].join('');
  }

  /**
   * 网格渐变：多色径向光斑均匀分布 + 圆形裁剪
   */
  private renderMesh(seed: string, size: number): string {
    const baseHue = seedToInt(seed, 'mesh-h', 0, 360);
    const blobCount = 4;
    const rot = seedToInt(seed, 'mesh-rot', 0, 360);
    const bg = `#${hslToHex((baseHue + 200) % 360, 35, 92)}`;
    const gradientDefs: string[] = [];
    const layers: string[] = [];

    for (let i = 0; i < blobCount; i++) {
      const hue = (baseHue + i * 90 + seedToInt(seed, `mesh-dh-${i}`, -15, 15)) % 360;
      const color = `#${hslToHex(hue, 78, 56)}`;
      const angleDeg = rot + (360 / blobCount) * i;
      const dist = 14 + seedToInt(seed, `mesh-dist-${i}`, 0, 12);
      const rad = (angleDeg * Math.PI) / 180;
      const cx = 50 + dist * Math.cos(rad);
      const cy = 50 + dist * Math.sin(rad);
      const radius = 38 + seedToInt(seed, `mesh-r-${i}`, 0, 10);
      const gradId = `mesh-${i}`;

      gradientDefs.push(
        `<radialGradient id="${gradId}" gradientUnits="userSpaceOnUse" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius}" fx="${cx.toFixed(1)}" fy="${cy.toFixed(1)}">`,
        `<stop offset="0%" stop-color="${color}"/>`,
        `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>`,
        `</radialGradient>`,
      );
      layers.push(`<rect width="100" height="100" fill="url(#${gradId})"/>`);
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">`,
      `<defs>`,
      `<clipPath id="clip"><circle cx="50" cy="50" r="50"/></clipPath>`,
      gradientDefs.join(''),
      `</defs>`,
      `<g clip-path="url(#clip)">`,
      `<rect width="100" height="100" fill="${bg}"/>`,
      layers.join(''),
      `</g>`,
      `</svg>`,
    ].join('');
  }

  /**
   * 几何弧环：自研同心分段圆弧
   */
  private renderGeo(seed: string, size: number): string {
    const hBase = seedToInt(seed, 'geo-h', 0, 360);
    const cA = `#${hslToHex(hBase, 62, 55)}`;
    const cB = `#${hslToHex((hBase + 35) % 360, 58, 68)}`;
    const layers: string[] = [];

    for (let ring = 0; ring < 5; ring++) {
      const radius = 12 + ring * 8;
      const segments = seedToInt(seed, `seg-${ring}`, 3, 7);
      const rot = seedToInt(seed, `rot-${ring}`, 0, 360);
      for (let s = 0; s < segments; s++) {
        const start = rot + (360 / segments) * s + seedToInt(seed, `gap-${ring}-${s}`, 0, 20);
        const sweep = seedToInt(seed, `sw-${ring}-${s}`, 25, 85);
        const color = (ring + s) % 2 === 0 ? cA : cB;
        layers.push(this.describeArc(50, 50, radius, start, sweep, color));
      }
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none">`,
      `<circle cx="50" cy="50" r="10" fill="${cA}"/>`,
      layers.join(''),
      `</svg>`,
    ].join('');
  }

  /**
   * 渐变首字：升级版首字头像
   */
  private renderInitials(
    name: string,
    size: number,
    bg?: string,
    fg?: string,
  ): string {
    const initial = escapeSvgText(this.extractInitial(name), 2);
    const hue = seedToHue(name);
    const hue2 = (hue + seedToInt(name, 'i2', 30, 90)) % 360;
    const background = bg
      ? `#${parseHexColor(bg, hslToHex(hue, 55, 55))}`
      : `url(#bg)`;
    const foreground = `#${parseHexColor(fg, 'ffffff')}`;
    const fontSize = Math.floor(size * 0.42);
    const r = size / 2;

    const defs = bg
      ? ''
      : [
          `<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">`,
          `<stop offset="0%" stop-color="#${hslToHex(hue, 60, 52)}"/>`,
          `<stop offset="100%" stop-color="#${hslToHex(hue2, 65, 42)}"/>`,
          `</linearGradient></defs>`,
        ].join('');

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
      defs,
      `<circle cx="${r}" cy="${r}" r="${r}" fill="${background}"/>`,
      `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"`,
      ` fill="${foreground}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${initial}</text>`,
      `</svg>`,
    ].join('');
  }

  /**
   * 提取显示字符（中文首字 / 英文首字母）
   */
  private extractInitial(name: string): string {
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
   * 生成 SVG 圆弧 path（角度制）
   */
  private describeArc(
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    sweepDeg: number,
    color: string,
  ): string {
    const start = ((startDeg % 360) * Math.PI) / 180;
    const end = (((startDeg + sweepDeg) % 360) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = sweepDeg > 180 ? 1 : 0;
    return `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
}
