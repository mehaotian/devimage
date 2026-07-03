import { PSEUDO_CODE_GOLDEN_HASHES } from './pseudo-code-golden';
import { assertGoldenSvg, verifyPseudoCodeGenerators } from './pseudo-code-verify';
import { renderPseudoBarcodeSvg } from './pseudo-barcode';
import { renderPseudoMatrixSvg } from './pseudo-matrix';

describe('pseudo-code-verify', () => {
  it('should pass generator verification', () => {
    expect(verifyPseudoCodeGenerators()).toEqual({ ok: true });
  });

  it('should throw on golden mismatch', () => {
    expect(() => assertGoldenSvg('<svg></svg>', 'qrDemo128Matrix')).toThrow(/Golden mismatch/);
  });

  it('should expose five golden route entries', () => {
    expect(Object.keys(PSEUDO_CODE_GOLDEN_HASHES)).toHaveLength(5);
  });

  it('should accept valid matrix svg', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'matrix' });
    expect(() => assertGoldenSvg(svg, 'qrDemo128Matrix')).not.toThrow();
  });

  it('should accept valid barcode svg', () => {
    const svg = renderPseudoBarcodeSvg({
      seed: 'sku-mock',
      width: 320,
      height: 80,
      variant: 'code128',
    });
    expect(() => assertGoldenSvg(svg, 'barcodeSku320x80')).not.toThrow();
  });
});
