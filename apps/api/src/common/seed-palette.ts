import { hslToHex, seedToHue } from './utils';

/** 由 seed 推导的全站协调配色（hex，不含 `#`） */
export interface SeedPalette {
  accent: string;
  bgLight: string;
  bgDark: string;
  titleLight: string;
  titleDark: string;
  subtitleLight: string;
  subtitleDark: string;
}

/**
 * 根据 seed 生成跨模块一致的 HSL 调色板
 */
export function resolveSeedPalette(seed: string): SeedPalette {
  const hue = seedToHue(seed);

  return {
    accent: hslToHex(hue, 65, 55),
    bgLight: hslToHex(hue, 28, 97),
    bgDark: hslToHex(hue, 22, 11),
    titleLight: hslToHex(hue, 35, 28),
    titleDark: hslToHex(hue, 18, 94),
    subtitleLight: hslToHex(hue, 22, 42),
    subtitleDark: hslToHex(hue, 12, 68),
  };
}
