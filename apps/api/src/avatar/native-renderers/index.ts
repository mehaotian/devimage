import { renderBot } from './bot.renderer';
import { renderBubbles } from './bubbles.renderer';
import { renderFace } from './face.renderer';
import { renderFlower } from './flower.renderer';
import { renderGlass, renderNeon, renderPaper, renderRiso } from './filter.renderer';
import { type NativeStyleRenderer } from './helpers';
import { renderHash } from './hash.renderer';
import { renderMandala } from './mandala.renderer';
import { renderMatrix } from './matrix.renderer';
import { renderPixel } from './pixel.renderer';
import { renderRadical } from './radical.renderer';
import { renderTopo } from './topo.renderer';

/** 实验性 native 风格 id → 渲染器映射 */
export const EXPERIMENTAL_NATIVE_RENDERERS: Readonly<Record<string, NativeStyleRenderer>> = {
  'devimg-mandala': renderMandala,
  'devimg-topo': renderTopo,
  'devimg-bubbles': renderBubbles,
  'devimg-pixel': renderPixel,
  'devimg-bot': renderBot,
  'devimg-face': renderFace,
  'devimg-flower': renderFlower,
  'devimg-hash': renderHash,
  'devimg-glass': renderGlass,
  'devimg-neon': renderNeon,
  'devimg-paper': renderPaper,
  'devimg-riso': renderRiso,
  'devimg-radical': renderRadical,
  'devimg-matrix': renderMatrix,
};

/**
 * 判断 style 是否为实验性 native 渲染器
 */
export function isExperimentalNativeStyle(style: string): boolean {
  return style in EXPERIMENTAL_NATIVE_RENDERERS;
}

/**
 * 调用实验性 native 渲染器
 */
export function renderExperimentalNative(
  style: string,
  seed: string,
  size: number,
  shape: 'circle' | 'square' = 'circle',
): string {
  const renderer = EXPERIMENTAL_NATIVE_RENDERERS[style];
  if (!renderer) {
    throw new Error(`Unknown experimental native style: ${style}`);
  }
  return renderer({ seed, size, shape });
}
