import { parseQueryFgBgAccent } from '../common/pseudo-code-colors';
import {
  parseMatrixRadius,
  parsePseudoMatrixVariant,
  type PseudoMatrixVariant,
} from '../common/pseudo-matrix';

/** 伪 QR query 参数 */
export interface QrQuery {
  readonly fg?: string;
  readonly bg?: string;
  readonly accent?: string;
  readonly variant?: string;
  readonly radius?: string;
}

/**
 * 提取伪 QR 路由 query 中的参数
 */
export function pickQrQuery(query: QrQuery): QrQuery {
  return {
    fg: query.fg,
    bg: query.bg,
    accent: query.accent,
    variant: query.variant,
    radius: query.radius,
  };
}

/**
 * 将 query 解析为渲染参数
 */
export function resolveQrRenderParams(query: QrQuery): {
  colors: { dark?: string; light?: string; accent?: string };
  variant: PseudoMatrixVariant;
  radius: number;
} {
  return {
    colors: parseQueryFgBgAccent(query.fg, query.bg, query.accent, {
      fg: '000000',
      bg: 'ffffff',
      accent: '6366f1',
    }),
    variant: parsePseudoMatrixVariant(query.variant),
    radius: parseMatrixRadius(query.radius),
  };
}
