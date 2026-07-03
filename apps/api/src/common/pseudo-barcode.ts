import { fnv1a32, seedToInt } from './seed';
import { hslToHex, parseHexColor } from './utils';

/** 伪条码视觉变体 */
export type PseudoBarcodeVariant = 'code128' | 'ean13';

/** 伪条码配色 */
export interface PseudoBarcodeColors {
  readonly dark?: string;
  readonly light?: string;
}

/** 伪条码渲染选项 */
export interface PseudoBarcodeOptions {
  readonly seed: string;
  readonly width: number;
  readonly height: number;
  readonly variant?: PseudoBarcodeVariant;
  readonly colors?: PseudoBarcodeColors;
}

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 25;
const QUIET_RATIO = 0.08;
const BAR_VERTICAL_PAD = 2.5;
const MODULE_COUNT = 95;

/**
 * 解析条码配色：query 传入优先，否则由 seed 推导
 */
function resolveBarcodeColor(
  value: string | undefined,
  seed: string,
  slot: string,
  saturation: number,
  lightness: number,
): string {
  if (value) {
    const raw = value.startsWith('#') ? value.slice(1) : value;
    return `#${parseHexColor(raw, '000000')}`;
  }
  const hue = seedToInt(seed, slot, 0, 360);
  return `#${hslToHex(hue, saturation, lightness)}`;
}

/**
 * 由 seed 生成模块级条纹图案（true = 黑条）
 */
function generateModulePattern(seed: string, variant: PseudoBarcodeVariant): boolean[] {
  const modules = Array.from({ length: MODULE_COUNT }, (_, i) => {
    const hash = fnv1a32(`${seed}\0bar-mod\0${variant}\0${i}`);
    const mixed = (hash ^ (hash >>> 9)) >>> 0;
    return (mixed & 0xff) > 125;
  });

  if (variant === 'ean13') {
    applyEan13GuardPattern(modules);
  }

  return modules;
}

/**
 * 写入 EAN-13 外形 guard 纹（非真实编码，仅视觉）
 */
function applyEan13GuardPattern(modules: boolean[]): void {
  const set = (index: number, filled: boolean) => {
    if (index >= 0 && index < modules.length) {
      modules[index] = filled;
    }
  };

  set(0, true);
  set(1, false);
  set(2, true);

  const mid = Math.floor(modules.length / 2);
  set(mid - 2, false);
  set(mid - 1, true);
  set(mid, false);
  set(mid + 1, true);
  set(mid + 2, false);

  set(modules.length - 3, true);
  set(modules.length - 2, false);
  set(modules.length - 1, true);
}

/**
 * 将连续黑模块合并为 SVG rect，减少 DOM 节点
 */
function renderBarRects(
  modules: boolean[],
  dark: string,
  barX0: number,
  barWidth: number,
  barY: number,
  barHeight: number,
): string {
  const parts: string[] = [];
  let runStart: number | null = null;

  const flush = (runEnd: number) => {
    if (runStart === null) {
      return;
    }
    const x = barX0 + runStart * barWidth;
    const w = (runEnd - runStart + 1) * barWidth;
    parts.push(
      `<rect x="${x.toFixed(3)}" y="${barY.toFixed(3)}" width="${w.toFixed(3)}" height="${barHeight.toFixed(3)}" fill="${dark}"/>`,
    );
    runStart = null;
  };

  for (let i = 0; i < modules.length; i += 1) {
    if (modules[i]) {
      if (runStart === null) {
        runStart = i;
      }
    } else {
      flush(i - 1);
    }
  }

  flush(modules.length - 1);
  return parts.join('');
}

/**
 * 解析伪条码变体 query
 */
export function parsePseudoBarcodeVariant(value: string | undefined): PseudoBarcodeVariant {
  if (!value || value === '') {
    return 'code128';
  }
  const normalized = value.toLowerCase();
  if (normalized === 'code128' || normalized === 'ean13') {
    return normalized;
  }
  throw new Error('Invalid variant. Use: code128, ean13');
}

/**
 * 渲染伪一维条形码 SVG（不可扫描，仅视觉占位）
 */
export function renderPseudoBarcodeSvg(options: PseudoBarcodeOptions): string {
  const variant = options.variant ?? 'code128';
  const dark = resolveBarcodeColor(options.colors?.dark, options.seed, 'bar-dark', 18, 12);
  const light = resolveBarcodeColor(options.colors?.light, options.seed, 'bar-light', 20, 98);

  const quiet = VIEW_WIDTH * QUIET_RATIO;
  const barX0 = quiet;
  const barAreaWidth = VIEW_WIDTH - quiet * 2;
  const moduleWidth = barAreaWidth / MODULE_COUNT;
  const barY = BAR_VERTICAL_PAD;
  const barHeight = VIEW_HEIGHT - BAR_VERTICAL_PAD * 2;

  const modules = generateModulePattern(options.seed, variant);
  const body = [
    `<rect width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" fill="${light}"/>`,
    renderBarRects(modules, dark, barX0, moduleWidth, barY, barHeight),
  ].join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}">`,
    body,
    `</svg>`,
  ].join('');
}

/** 模块数量（供测试） */
export const PSEUDO_BARCODE_MODULE_COUNT = MODULE_COUNT;
