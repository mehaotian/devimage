import { parseHexColor } from './utils';

/** 伪码 fg/bg 配色（hex，含 `#`） */
export interface PseudoCodeFgBg {
  readonly dark?: string;
  readonly light?: string;
}

/** 伪 QR fg/bg/accent 配色 */
export interface PseudoCodeFgBgAccent extends PseudoCodeFgBg {
  readonly accent?: string;
}

/**
 * 解析 query 中的 fg/bg hex 配色
 */
export function parseQueryFgBg(
  fg: string | undefined,
  bg: string | undefined,
  defaults: { readonly fg: string; readonly bg: string },
): PseudoCodeFgBg {
  const colors: { dark?: string; light?: string } = {};

  if (fg !== undefined && fg !== '') {
    colors.dark = `#${parseHexColor(fg, defaults.fg)}`;
  }
  if (bg !== undefined && bg !== '') {
    colors.light = `#${parseHexColor(bg, defaults.bg)}`;
  }

  return colors;
}

/**
 * 解析 query 中的 fg/bg/accent hex 配色
 */
export function parseQueryFgBgAccent(
  fg: string | undefined,
  bg: string | undefined,
  accent: string | undefined,
  defaults: { readonly fg: string; readonly bg: string; readonly accent: string },
): PseudoCodeFgBgAccent {
  const colors: { dark?: string; light?: string; accent?: string } = {
    ...parseQueryFgBg(fg, bg, defaults),
  };

  if (accent !== undefined && accent !== '') {
    colors.accent = `#${parseHexColor(accent, defaults.accent)}`;
  }

  return colors;
}
