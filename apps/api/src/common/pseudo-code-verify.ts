import { PSEUDO_CODE_GOLDEN_HASHES, sha256Svg } from './pseudo-code-golden';
import { renderPseudoBarcodeSvg } from './pseudo-barcode';
import { renderPseudoMatrixSvg } from './pseudo-matrix';

export type PseudoCodeGoldenKey = keyof typeof PSEUDO_CODE_GOLDEN_HASHES;

/**
 * 断言 SVG 与 golden 哈希一致
 */
export function assertGoldenSvg(svg: string, key: PseudoCodeGoldenKey): void {
  const hash = sha256Svg(svg);
  const expected = PSEUDO_CODE_GOLDEN_HASHES[key];
  if (hash !== expected) {
    throw new Error(`Golden mismatch for ${key}: expected ${expected}, got ${hash}`);
  }
}

/**
 * 校验伪码核心生成器可用且输出符合 golden
 */
export function verifyPseudoCodeGenerators(): { ok: true } | { ok: false; detail: string } {
  try {
    assertGoldenSvg(
      renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'matrix' }),
      'qrDemo128Matrix',
    );
    assertGoldenSvg(
      renderPseudoBarcodeSvg({ seed: 'sku-mock', width: 320, height: 80, variant: 'code128' }),
      'barcodeSku320x80',
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'pseudo-code golden check failed',
    };
  }
}

/** e2e / 冒烟用的 golden 路由表 */
export const PSEUDO_CODE_GOLDEN_ROUTES: ReadonlyArray<{
  readonly url: string;
  readonly key: PseudoCodeGoldenKey;
}> = [
  { url: '/qr/demo/128', key: 'qrDemo128Matrix' },
  { url: '/qr/demo/128?variant=dots', key: 'qrDemo128Dots' },
  { url: '/qr/checkout/256', key: 'qrCheckout256' },
  { url: '/barcode/sku-mock/320/80', key: 'barcodeSku320x80' },
  { url: '/barcode/demo/320/80?variant=ean13', key: 'barcodeEan13' },
];
