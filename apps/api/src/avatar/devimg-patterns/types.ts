/** CSS 纹理 pattern 标识 */
export type DevimgPatternId =
  | 'stripes'
  | 'vertical-stripes'
  | 'horizontal-stripes'
  | 'polka'
  | 'checker'
  | 'diagonal-checker'
  | 'grid'
  | 'lined-paper'
  | 'houndstooth'
  | 'argyle'
  | 'weave'
  | 'tablecloth'
  | 'carbon'
  | 'shippo'
  | 'zigzag'
  | 'bricks'
  | 'triangles'
  | 'cross'
  | 'steps'
  | 'dots-offset'
  | 'concentric'
  | 'microbial'
  | 'waves'
  | 'seigaiha'
  | 'half-rombes'
  | 'marrakesh'
  | 'atomic'
  | 'cicada'
  | 'pyramid'
  | 'arrows'
  | 'honeycomb'
  | 'japanese-cube'
  | 'stars'
  | 'hearts'
  | 'yin-yang'
  | 'starry-night'
  | 'pinwheel'
  | 'quatrefoil'
  | 'scales';

/** pattern 渲染上下文（viewBox 100×100） */
export interface PatternRenderContext {
  readonly c1: string;
  readonly c2: string;
  readonly c3: string;
  readonly cell: number;
  readonly angle: number;
}

/** pattern 渲染结果 */
export interface PatternRenderResult {
  readonly defs: string;
  readonly body: string;
}

/** 单个 pattern 渲染函数 */
export type PatternRenderer = (ctx: PatternRenderContext) => PatternRenderResult;

/** Playground / 文档用分组元数据 */
export interface PatternGroupMeta {
  readonly id: string;
  readonly title: string;
  readonly patterns: readonly DevimgPatternId[];
}

/** pattern 目录 API 响应项 */
export interface PatternCatalogItem {
  readonly id: DevimgPatternId;
  readonly title: string;
}

/** pattern 分组 API 响应 */
export interface PatternCatalogGroup {
  readonly id: string;
  readonly title: string;
  readonly patterns: readonly PatternCatalogItem[];
}
