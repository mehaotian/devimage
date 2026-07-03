import { renderPseudoBarcodeSvg } from './pseudo-barcode';
import { PSEUDO_CODE_GOLDEN_HASHES, sha256Svg } from './pseudo-code-golden';
import { renderPseudoMatrixSvg } from './pseudo-matrix';

describe('pseudo-code golden hashes', () => {
  it('should match golden hash for qr demo matrix 128', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'matrix' });
    expect(sha256Svg(svg)).toBe(PSEUDO_CODE_GOLDEN_HASHES.qrDemo128Matrix);
  });

  it('should match golden hash for qr demo dots 128', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'dots' });
    expect(sha256Svg(svg)).toBe(PSEUDO_CODE_GOLDEN_HASHES.qrDemo128Dots);
  });

  it('should match golden hash for qr checkout 256', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'checkout', width: 256, variant: 'matrix' });
    expect(sha256Svg(svg)).toBe(PSEUDO_CODE_GOLDEN_HASHES.qrCheckout256);
  });

  it('should match golden hash for barcode sku-mock 320x80', () => {
    const svg = renderPseudoBarcodeSvg({
      seed: 'sku-mock',
      width: 320,
      height: 80,
      variant: 'code128',
    });
    expect(sha256Svg(svg)).toBe(PSEUDO_CODE_GOLDEN_HASHES.barcodeSku320x80);
  });

  it('should match golden hash for barcode ean13', () => {
    const svg = renderPseudoBarcodeSvg({
      seed: 'demo',
      width: 320,
      height: 80,
      variant: 'ean13',
    });
    expect(sha256Svg(svg)).toBe(PSEUDO_CODE_GOLDEN_HASHES.barcodeEan13);
  });
});
