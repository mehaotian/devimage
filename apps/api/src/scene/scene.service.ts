import { Injectable } from '@nestjs/common';
import { escapeSvgText, parseDimension } from '../common/utils';

export type SceneVariant = '404' | 'empty' | 'network' | 'search';

/**
 * 场景占位图（404、空状态等）SVG 生成服务
 */
@Injectable()
export class SceneService {
  private readonly copy: Record<SceneVariant, { title: string; subtitle: string }> = {
    '404': { title: '404', subtitle: '页面不存在' },
    empty: { title: '暂无数据', subtitle: '这里还是空的' },
    network: { title: '网络异常', subtitle: '请检查网络后重试' },
    search: { title: '无搜索结果', subtitle: '换个关键词试试' },
  };

  /**
   * 渲染场景占位 SVG
   */
  render(variant: SceneVariant, w = 800, h = 600): string {
    const width = parseDimension(w, 'width');
    const height = parseDimension(h, 'height');
    const { title, subtitle } = this.copy[variant] ?? this.copy.empty;
    const titleSize = Math.floor(Math.min(width, height) * 0.12);
    const subSize = Math.floor(titleSize * 0.4);

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect width="100%" height="100%" fill="#f8fafc"/>`,
      `<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle"`,
      ` fill="#334155" font-family="system-ui,sans-serif" font-size="${titleSize}" font-weight="700">${escapeSvgText(title)}</text>`,
      `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"`,
      ` fill="#64748b" font-family="system-ui,sans-serif" font-size="${subSize}">${escapeSvgText(subtitle)}</text>`,
      `</svg>`,
    ].join('');
  }
}
