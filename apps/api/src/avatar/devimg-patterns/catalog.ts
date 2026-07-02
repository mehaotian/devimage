import type { DevimgPatternId, PatternCatalogGroup, PatternGroupMeta, PatternRenderer } from './types';
import {
  renderChecker,
  renderDiagonalChecker,
  renderGrid,
  renderHorizontalStripes,
  renderLinedPaper,
  renderPolka,
  renderStripes,
  renderVerticalStripes,
} from './templates/basic';
import {
  renderArgyle,
  renderCarbon,
  renderHoundstooth,
  renderShippo,
  renderTablecloth,
  renderWeave,
} from './templates/textile';
import {
  renderBricks,
  renderCross,
  renderSteps,
  renderTriangles,
  renderZigzag,
} from './templates/geometric';
import {
  renderArrows,
  renderAtomic,
  renderCicada,
  renderHalfRombes,
  renderHoneycomb,
  renderJapaneseCube,
  renderMarrakesh,
  renderPyramid,
} from './templates/advanced';
import {
  renderConcentric,
  renderDotsOffset,
  renderMicrobial,
  renderSeigaiha,
  renderWaves,
} from './templates/wave';
import {
  renderHearts,
  renderPinwheel,
  renderQuatrefoil,
  renderScales,
  renderStars,
  renderStarryNight,
  renderYinYang,
} from './templates/symbol';
import { renderGingham, renderMadras, renderPlaid, renderTartan } from './templates/premium';

/** pattern 中文标题（Playground / API 目录） */
export const PATTERN_TITLES: Record<DevimgPatternId, string> = {
  stripes: '斜纹',
  'vertical-stripes': '竖纹',
  'horizontal-stripes': '横纹',
  polka: '波点',
  checker: '棋盘',
  'diagonal-checker': '斜棋盘',
  grid: '网格',
  'lined-paper': '横线纸',
  houndstooth: '千鸟格',
  argyle: '菱形',
  weave: '编织',
  tablecloth: '桌布格',
  carbon: '碳纤维',
  shippo: '七宝',
  zigzag: '锯齿',
  bricks: '砖墙',
  triangles: '三角',
  cross: '十字',
  steps: '阶梯',
  'dots-offset': '错位波点',
  concentric: '同心圆',
  microbial: '气泡',
  waves: '波浪',
  seigaiha: '青海波',
  'half-rombes': '半菱形',
  marrakesh: '摩洛哥',
  atomic: '原子网格',
  cicada: '蝉翼纹',
  pyramid: '金字塔',
  arrows: '箭头',
  honeycomb: '蜂窝',
  'japanese-cube': '立体方块',
  stars: '五角星',
  hearts: '心形',
  'yin-yang': '阴阳',
  'starry-night': '星空',
  pinwheel: '风车',
  quatrefoil: '四叶花',
  scales: '鱼鳞',
  tartan: '苏格兰格',
  madras: '马德拉斯',
  gingham: '四色格布',
  plaid: '十字 plaid',
};

/** Playground / 文档用分组 */
export const PATTERN_GROUPS: readonly PatternGroupMeta[] = [
  {
    id: 'basic',
    title: '基础',
    patterns: [
      'stripes',
      'vertical-stripes',
      'horizontal-stripes',
      'polka',
      'checker',
      'diagonal-checker',
      'grid',
      'lined-paper',
    ],
  },
  {
    id: 'textile',
    title: '织物',
    patterns: ['houndstooth', 'argyle', 'weave', 'tablecloth', 'carbon', 'shippo'],
  },
  {
    id: 'geometric',
    title: '几何',
    patterns: ['zigzag', 'bricks', 'triangles', 'cross', 'steps'],
  },
  {
    id: 'wave',
    title: '波纹',
    patterns: ['dots-offset', 'concentric', 'microbial', 'waves', 'seigaiha'],
  },
  {
    id: 'advanced',
    title: '进阶几何',
    patterns: [
      'half-rombes',
      'marrakesh',
      'atomic',
      'cicada',
      'pyramid',
      'arrows',
      'honeycomb',
      'japanese-cube',
    ],
  },
  {
    id: 'symbol',
    title: '符号',
    patterns: ['stars', 'hearts', 'yin-yang', 'starry-night', 'pinwheel', 'quatrefoil', 'scales'],
  },
  {
    id: 'premium',
    title: '精品',
    patterns: ['tartan', 'madras', 'gingham', 'plaid'],
  },
] as const;

/** 全部 pattern id（顺序与 seed 槽位一致） */
export const DEVIMG_PATTERN_IDS: readonly DevimgPatternId[] = PATTERN_GROUPS.flatMap(
  (group) => group.patterns,
);

const PATTERN_RENDERERS: Record<DevimgPatternId, PatternRenderer> = {
  stripes: renderStripes,
  'vertical-stripes': renderVerticalStripes,
  'horizontal-stripes': renderHorizontalStripes,
  polka: renderPolka,
  checker: renderChecker,
  'diagonal-checker': renderDiagonalChecker,
  grid: renderGrid,
  'lined-paper': renderLinedPaper,
  houndstooth: renderHoundstooth,
  argyle: renderArgyle,
  weave: renderWeave,
  tablecloth: renderTablecloth,
  carbon: renderCarbon,
  shippo: renderShippo,
  zigzag: renderZigzag,
  bricks: renderBricks,
  triangles: renderTriangles,
  cross: renderCross,
  steps: renderSteps,
  'dots-offset': renderDotsOffset,
  concentric: renderConcentric,
  microbial: renderMicrobial,
  waves: renderWaves,
  seigaiha: renderSeigaiha,
  'half-rombes': renderHalfRombes,
  marrakesh: renderMarrakesh,
  atomic: renderAtomic,
  cicada: renderCicada,
  pyramid: renderPyramid,
  arrows: renderArrows,
  honeycomb: renderHoneycomb,
  'japanese-cube': renderJapaneseCube,
  stars: renderStars,
  hearts: renderHearts,
  'yin-yang': renderYinYang,
  'starry-night': renderStarryNight,
  pinwheel: renderPinwheel,
  quatrefoil: renderQuatrefoil,
  scales: renderScales,
  tartan: renderTartan,
  madras: renderMadras,
  gingham: renderGingham,
  plaid: renderPlaid,
};

/**
 * 获取 pattern 渲染器
 */
export function getPatternRenderer(id: DevimgPatternId): PatternRenderer {
  return PATTERN_RENDERERS[id];
}

/**
 * 列出合法 pattern id 字符串（供错误提示）
 */
export function listDevimgPatternIds(): readonly DevimgPatternId[] {
  return DEVIMG_PATTERN_IDS;
}

/**
 * 构建 pattern 目录（供 API / Playground）
 */
export function buildPatternCatalog(): { count: number; groups: PatternCatalogGroup[] } {
  const groups: PatternCatalogGroup[] = PATTERN_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    patterns: group.patterns.map((id) => ({
      id,
      title: PATTERN_TITLES[id],
    })),
  }));

  return { count: DEVIMG_PATTERN_IDS.length, groups };
}
