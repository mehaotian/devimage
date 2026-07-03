import { Injectable } from '@nestjs/common';
import { parseDimension } from '../common/utils';
import type { SkeletonTheme, SkeletonType } from './skeleton-query';

export interface SkeletonOptions {
  width: number;
  height: number;
  type: SkeletonType;
  theme: SkeletonTheme;
  cols: number;
  animate: boolean;
}

/** 主题配色 */
interface SkeletonPalette {
  canvas: string;
  block: string;
  blockAlt: string;
}

const PALETTES: Record<SkeletonTheme, SkeletonPalette> = {
  light: { canvas: '#f1f5f9', block: '#e2e8f0', blockAlt: '#cbd5e1' },
  dark: { canvas: '#0f172a', block: '#334155', blockAlt: '#475569' },
};

/**
 * 骨架屏 SVG 生成服务（100% 程序绘制）
 */
@Injectable()
export class SkeletonService {
  /**
   * 解析并校验骨架屏参数
   */
  resolveOptions(
    w: string,
    h: string,
    type: SkeletonType,
    theme: SkeletonTheme,
    cols: number,
    animate: boolean,
  ): SkeletonOptions {
    return {
      width: parseDimension(w, 'width'),
      height: parseDimension(h, 'height'),
      type,
      theme,
      cols,
      animate,
    };
  }

  /**
   * 渲染骨架屏 SVG
   */
  renderSvg(options: SkeletonOptions): string {
    const { width, height, type, theme, cols, animate } = options;
    const palette = PALETTES[theme];
    const body = this.renderBody(type, width, height, palette, cols);
    const shimmer = animate ? this.buildShimmerDefs(palette) : { defs: '', overlay: '' };

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"`,
      ` viewBox="0 0 ${width} ${height}">`,
      shimmer.defs,
      `<rect width="100%" height="100%" fill="${palette.canvas}"/>`,
      body,
      shimmer.overlay,
      `</svg>`,
    ].join('');
  }

  /**
   * 按 type 分发绘制逻辑
   */
  private renderBody(
    type: SkeletonType,
    width: number,
    height: number,
    palette: SkeletonPalette,
    cols: number,
  ): string {
    switch (type) {
      case 'card':
        return this.renderCard(width, height, palette);
      case 'row':
        return this.renderRow(width, height, palette);
      case 'grid':
        return this.renderGrid(width, height, palette, cols);
      case 'page':
      default:
        return this.renderPage(width, height, palette);
    }
  }

  /**
   * 全页骨架：顶栏 + 多块卡片
   */
  private renderPage(width: number, height: number, palette: SkeletonPalette): string {
    const pad = Math.max(8, Math.floor(Math.min(width, height) * 0.04));
    const barH = Math.max(12, Math.floor(height * 0.06));
    const gap = Math.max(8, Math.floor(pad * 0.75));
    const cardH = Math.max(24, Math.floor((height - pad * 2 - barH - gap * 3) / 3));
    const parts: string[] = [
      this.roundRect(pad, pad, width - pad * 2, barH, 6, palette.block),
    ];

    let y = pad + barH + gap;
    for (let i = 0; i < 3; i += 1) {
      parts.push(this.roundRect(pad, y, width - pad * 2, cardH, 8, palette.blockAlt));
      y += cardH + gap;
    }

    return parts.join('');
  }

  /**
   * 卡片骨架：左图 + 右文
   */
  private renderCard(width: number, height: number, palette: SkeletonPalette): string {
    const pad = Math.max(8, Math.floor(Math.min(width, height) * 0.08));
    const thumb = Math.min(width * 0.32, height - pad * 2);
    const lineH = Math.max(8, Math.floor(height * 0.12));
    const gap = Math.max(6, Math.floor(lineH * 0.6));
    const textX = pad + thumb + pad;
    const textW = width - textX - pad;

    return [
      this.roundRect(pad, pad, thumb, height - pad * 2, 8, palette.block),
      this.roundRect(textX, pad, textW, lineH, 4, palette.blockAlt),
      this.roundRect(textX, pad + lineH + gap, textW * 0.85, lineH, 4, palette.block),
      this.roundRect(textX, pad + (lineH + gap) * 2, textW * 0.55, lineH, 4, palette.blockAlt),
    ].join('');
  }

  /**
   * 列表行骨架：圆头像 + 两行文字
   */
  private renderRow(width: number, height: number, palette: SkeletonPalette): string {
    const pad = Math.max(6, Math.floor(Math.min(width, height) * 0.1));
    const avatar = Math.min(height - pad * 2, width * 0.18);
    const lineH = Math.max(6, Math.floor(height * 0.22));
    const gap = Math.max(4, Math.floor(lineH * 0.5));
    const textX = pad + avatar + pad;
    const textW = width - textX - pad;
    const cy = height / 2;

    return [
      `<circle cx="${pad + avatar / 2}" cy="${cy}" r="${avatar / 2}" fill="${palette.block}"/>`,
      this.roundRect(textX, cy - lineH - gap / 2, textW, lineH, 4, palette.blockAlt),
      this.roundRect(textX, cy + gap / 2, textW * 0.7, lineH, 4, palette.block),
    ].join('');
  }

  /**
   * 网格骨架
   */
  private renderGrid(
    width: number,
    height: number,
    palette: SkeletonPalette,
    cols: number,
  ): string {
    const pad = Math.max(8, Math.floor(Math.min(width, height) * 0.04));
    const gap = Math.max(8, Math.floor(pad * 0.75));
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const cellW = (innerW - gap * (cols - 1)) / cols;
    const rows = Math.max(1, Math.floor((innerH + gap) / (cellW * 0.75 + gap)));
    const cellH = (innerH - gap * (rows - 1)) / rows;
    const parts: string[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = pad + col * (cellW + gap);
        const y = pad + row * (cellH + gap);
        const fill = (row + col) % 2 === 0 ? palette.block : palette.blockAlt;
        parts.push(this.roundRect(x, y, cellW, cellH, 8, fill));
      }
    }

    return parts.join('');
  }

  /**
   * 圆角矩形 SVG 片段
   */
  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string,
  ): string {
    const rx = Math.min(r, w / 2, h / 2);
    return [
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}"`,
      ` height="${h.toFixed(1)}" rx="${rx.toFixed(1)}" fill="${fill}"/>`,
    ].join('');
  }

  /**
   * 静态 shimmer 渐变层（animate=1）
   */
  private buildShimmerDefs(palette: SkeletonPalette): { defs: string; overlay: string } {
    return {
      defs: [
        `<defs>`,
        `<linearGradient id="sk-shimmer" x1="0" y1="0" x2="1" y2="0">`,
        `<stop offset="0%" stop-color="${palette.canvas}" stop-opacity="0"/>`,
        `<stop offset="50%" stop-color="${palette.blockAlt}" stop-opacity="0.35"/>`,
        `<stop offset="100%" stop-color="${palette.canvas}" stop-opacity="0"/>`,
        `</linearGradient>`,
        `</defs>`,
      ].join(''),
      overlay: `<rect width="100%" height="100%" fill="url(#sk-shimmer)"/>`,
    };
  }
}
