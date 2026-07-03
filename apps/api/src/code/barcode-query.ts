import { parseQueryFgBg } from '../common/pseudo-code-colors';
import { parsePseudoBarcodeVariant, type PseudoBarcodeVariant } from '../common/pseudo-barcode';

/** 伪条码 query 参数 */
export interface BarcodeQuery {
  readonly fg?: string;
  readonly bg?: string;
  readonly variant?: string;
}

/**
 * 提取伪条码路由 query
 */
export function pickBarcodeQuery(query: BarcodeQuery): BarcodeQuery {
  return {
    fg: query.fg,
    bg: query.bg,
    variant: query.variant,
  };
}

/**
 * 解析 query 中的变体与配色
 */
export function resolveBarcodeRenderParams(query: BarcodeQuery): {
  variant: PseudoBarcodeVariant;
  colors: { dark?: string; light?: string };
} {
  return {
    variant: parsePseudoBarcodeVariant(query.variant),
    colors: parseQueryFgBg(query.fg, query.bg, { fg: '000000', bg: 'ffffff' }),
  };
}
