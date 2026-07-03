import { createHash } from 'crypto';

/** 已知 seed 输出的 SVG SHA-256（变更生成算法时需同步更新） */
export const PSEUDO_CODE_GOLDEN_HASHES = {
  qrDemo128Matrix: 'ffe22dea9d1bef54fb4047f39ce9fb357e7d1ccf9487031f06d3e9a8777a438e',
  qrDemo128Dots: 'f712fef7723c33ce0c376356d22cf9076807887bf9cfdd66bdff4c15985e5430',
  qrCheckout256: 'ef687644daf8b90d3aad7c42869a851a49f1ed3e83e7f9bc569dad3217ad9225',
  barcodeSku320x80: 'f87b029e2d46d87bd6ef2ca0371e2976f14f861eaeab403359857b20d5acfa19',
  barcodeEan13: '4bdae5f7c6105da9582c67ccfd8a8704ad7a5fb6371794e149d4aba9ce32cfa8',
} as const;

/**
 * 对 SVG 字符串计算 SHA-256
 */
export function sha256Svg(svg: string): string {
  return createHash('sha256').update(svg).digest('hex');
}
