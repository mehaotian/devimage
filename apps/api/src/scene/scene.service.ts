import { Injectable } from '@nestjs/common';
import { resolveSeedPalette } from '../common/seed-palette';
import { escapeSvgText, parseDimension } from '../common/utils';
import type { SceneRenderOptions, SceneTheme } from './scene-query';

export type SceneVariant = '404' | 'empty' | 'network' | 'search';

/** 场景默认文案 */
interface SceneCopy {
  title: string;
  subtitle: string;
}

/** 主题默认配色（无 seed 时） */
interface SceneThemeColors {
  bg: string;
  title: string;
  subtitle: string;
  accent: string;
}

/** 场景 typography */
interface SceneTypography {
  titleSize: number;
  subSize: number;
}

/** 文案块垂直布局（hanging 顶边 y，light/dark 完全一致） */
interface SceneTextLayout {
  blockTop: number;
  titleTop: number;
  accentX: number;
  accentY: number;
  accentWidth: number;
  accentHeight: number;
  subtitleTop: number;
  sectionGap: number;
}

const DEFAULT_THEME: Record<SceneTheme, SceneThemeColors> = {
  light: {
    bg: '#f8fafc',
    title: '#334155',
    subtitle: '#64748b',
    accent: '#6366f1',
  },
  dark: {
    bg: '#0f172a',
    title: '#f1f5f9',
    subtitle: '#94a3b8',
    accent: '#818cf8',
  },
};

/**
 * 场景占位图（404、空状态等）SVG 生成服务
 */
@Injectable()
export class SceneService {
  private readonly copy: Record<SceneVariant, SceneCopy> = {
    '404': { title: '404', subtitle: '页面不存在' },
    empty: { title: '暂无数据', subtitle: '这里还是空的' },
    network: { title: '网络异常', subtitle: '请检查网络后重试' },
    search: { title: '无搜索结果', subtitle: '换个关键词试试' },
  };

  /**
   * 渲染场景占位 SVG
   */
  render(
    variant: SceneVariant,
    w = 800,
    h = 600,
    options: SceneRenderOptions = { theme: 'light' },
  ): string {
    const width = parseDimension(w, 'width');
    const height = parseDimension(h, 'height');
    const defaults = this.copy[variant] ?? this.copy.empty;
    const title = options.title ?? defaults.title;
    const subtitle = options.subtitle ?? defaults.subtitle;
    const colors = this.resolveColors(options);
    const typography = this.resolveTypography(width, height);
    const layout = this.layoutTextBlock(
      width,
      height,
      typography.titleSize,
      typography.subSize,
    );

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect width="100%" height="100%" fill="${colors.bg}"/>`,
      `<g>`,
      `<text x="50%" y="${layout.titleTop}" dominant-baseline="hanging" text-anchor="middle"`,
      ` fill="${colors.title}" font-family="system-ui,-apple-system,sans-serif"`,
      ` font-size="${typography.titleSize}" font-weight="600" letter-spacing="0.08em">${escapeSvgText(title)}</text>`,
      `<rect x="${layout.accentX}" y="${layout.accentY}" width="${layout.accentWidth}"`,
      ` height="${layout.accentHeight}" rx="${layout.accentHeight / 2}" fill="${colors.accent}" opacity="0.7"/>`,
      `<text x="50%" y="${layout.subtitleTop}" dominant-baseline="hanging" text-anchor="middle"`,
      ` fill="${colors.subtitle}" font-family="system-ui,-apple-system,sans-serif"`,
      ` font-size="${typography.subSize}" letter-spacing="0.05em">${escapeSvgText(subtitle)}</text>`,
      `</g>`,
      `</svg>`,
    ].join('');
  }

  /**
   * 解析字号（与 theme 无关，保证 light/dark 排版一致）
   */
  private resolveTypography(width: number, height: number): SceneTypography {
    const shortSide = Math.min(width, height);
    const titleSize = Math.max(
      16,
      Math.min(Math.floor(shortSide * 0.064), Math.floor(height * 0.06)),
    );
    const subSize = Math.max(12, Math.floor(titleSize * 0.48));

    return { titleSize, subSize };
  }

  /**
   * 计算文案块位置：标题 → 段间距 → accent → 相同段间距 → 副标题
   */
  private layoutTextBlock(
    width: number,
    height: number,
    titleSize: number,
    subSize: number,
  ): SceneTextLayout {
    const accentHeight = 2;
    const accentWidth = Math.min(Math.round(width * 0.08), 44);
    const sectionGap = Math.max(36, Math.round(height * 0.12));
    const blockHeight =
      titleSize + sectionGap + accentHeight + sectionGap + subSize;
    const blockTop = Math.round((height - blockHeight) / 2);
    const titleTop = blockTop;
    const accentY = titleTop + titleSize + sectionGap;
    const subtitleTop = accentY + accentHeight + sectionGap;

    return {
      blockTop,
      titleTop,
      accentX: Math.round((width - accentWidth) / 2),
      accentY,
      accentWidth,
      accentHeight,
      subtitleTop,
      sectionGap,
    };
  }

  /**
   * 合并 theme / seed / accent 得到最终配色
   */
  private resolveColors(options: SceneRenderOptions): SceneThemeColors {
    const base = DEFAULT_THEME[options.theme];

    if (!options.seed) {
      return {
        ...base,
        accent: options.accent ? `#${options.accent}` : base.accent,
      };
    }

    const palette = resolveSeedPalette(options.seed);
    const isDark = options.theme === 'dark';

    return {
      bg: `#${isDark ? palette.bgDark : palette.bgLight}`,
      title: `#${isDark ? palette.titleDark : palette.titleLight}`,
      subtitle: `#${isDark ? palette.subtitleDark : palette.subtitleLight}`,
      accent: options.accent ? `#${options.accent}` : `#${palette.accent}`,
    };
  }
}
