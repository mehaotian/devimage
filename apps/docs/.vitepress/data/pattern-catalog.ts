/** Playground 纹理画廊静态目录（与 API catalog 同步，避免 /avatar/patterns 缓存导致缺组） */
export interface PatternCatalogEntry {
  readonly id: string;
  readonly title: string;
}

export interface PatternCatalogGroup {
  readonly id: string;
  readonly title: string;
  readonly patterns: readonly PatternCatalogEntry[];
}

export interface PatternGroupOption {
  readonly id: string;
  readonly title: string;
  readonly options: readonly { id: string; label: string }[];
}

/** 当前 pattern 总数（与 apps/api devimg-patterns/catalog 一致） */
export const EXPECTED_PATTERN_COUNT = 43;

/** 完整 7 组纹理目录 */
export const PATTERN_CATALOG: readonly PatternCatalogGroup[] = [
  {
    id: 'basic',
    title: '基础',
    patterns: [
      { id: 'stripes', title: '斜纹' },
      { id: 'vertical-stripes', title: '竖纹' },
      { id: 'horizontal-stripes', title: '横纹' },
      { id: 'polka', title: '波点' },
      { id: 'checker', title: '棋盘' },
      { id: 'diagonal-checker', title: '斜棋盘' },
      { id: 'grid', title: '网格' },
      { id: 'lined-paper', title: '横线纸' },
    ],
  },
  {
    id: 'textile',
    title: '织物',
    patterns: [
      { id: 'houndstooth', title: '千鸟格' },
      { id: 'argyle', title: '菱形' },
      { id: 'weave', title: '编织' },
      { id: 'tablecloth', title: '桌布格' },
      { id: 'carbon', title: '碳纤维' },
      { id: 'shippo', title: '七宝' },
    ],
  },
  {
    id: 'geometric',
    title: '几何',
    patterns: [
      { id: 'zigzag', title: '锯齿' },
      { id: 'bricks', title: '砖墙' },
      { id: 'triangles', title: '三角' },
      { id: 'cross', title: '十字' },
      { id: 'steps', title: '阶梯' },
    ],
  },
  {
    id: 'wave',
    title: '波纹',
    patterns: [
      { id: 'dots-offset', title: '错位波点' },
      { id: 'concentric', title: '同心圆' },
      { id: 'microbial', title: '气泡' },
      { id: 'waves', title: '波浪' },
      { id: 'seigaiha', title: '青海波' },
    ],
  },
  {
    id: 'advanced',
    title: '进阶几何',
    patterns: [
      { id: 'half-rombes', title: '半菱形' },
      { id: 'marrakesh', title: '摩洛哥' },
      { id: 'atomic', title: '原子网格' },
      { id: 'cicada', title: '蝉翼纹' },
      { id: 'pyramid', title: '金字塔' },
      { id: 'arrows', title: '箭头' },
      { id: 'honeycomb', title: '蜂窝' },
      { id: 'japanese-cube', title: '立体方块' },
    ],
  },
  {
    id: 'symbol',
    title: '符号',
    patterns: [
      { id: 'stars', title: '五角星' },
      { id: 'hearts', title: '心形' },
      { id: 'yin-yang', title: '阴阳' },
      { id: 'starry-night', title: '星空' },
      { id: 'pinwheel', title: '风车' },
      { id: 'quatrefoil', title: '四叶花' },
      { id: 'scales', title: '鱼鳞' },
    ],
  },
  {
    id: 'premium',
    title: '精品',
    patterns: [
      { id: 'tartan', title: '苏格兰格' },
      { id: 'madras', title: '马德拉斯' },
      { id: 'gingham', title: '四色格布' },
      { id: 'plaid', title: '十字 plaid' },
    ],
  },
] as const;

/**
 * 将 API / 静态目录转为 Playground 下拉与画廊结构
 */
export function toPatternGroupOptions(
  groups: readonly {
    id?: string;
    title: string;
    patterns: readonly { id: string; title: string }[];
  }[],
): PatternGroupOption[] {
  return groups.map((group) => ({
    id: group.id ?? group.title,
    title: group.title,
    options: group.patterns.map((item) => ({
      id: item.id,
      label: `${item.id} ${item.title}`,
    })),
  }));
}

/**
 * 统计目录 pattern 数量
 */
export function countPatterns(
  groups: readonly { patterns: readonly unknown[] }[],
): number {
  return groups.reduce((sum, group) => sum + group.patterns.length, 0);
}

/**
 * 合并 API 与静态目录：取 pattern 数较多的一方，避免浏览器缓存旧列表
 */
export function mergePatternCatalog(
  apiGroups: readonly { id?: string; title: string; patterns: readonly { id: string; title: string }[] }[],
): PatternGroupOption[] {
  const staticOptions = toPatternGroupOptions(PATTERN_CATALOG);
  if (!apiGroups.length) {
    return staticOptions;
  }
  const apiCount = countPatterns(apiGroups);
  if (apiCount >= EXPECTED_PATTERN_COUNT) {
    return toPatternGroupOptions(apiGroups);
  }
  return staticOptions;
}
