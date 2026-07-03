import {
  PSEUDO_BARCODE_MODULE_COUNT,
  parsePseudoBarcodeVariant,
  renderPseudoBarcodeSvg,
} from './pseudo-barcode';

describe('pseudo-barcode', () => {
  it('should render deterministically for the same seed', () => {
    const a = renderPseudoBarcodeSvg({ seed: 'sku-mock', width: 320, height: 80 });
    const b = renderPseudoBarcodeSvg({ seed: 'sku-mock', width: 320, height: 80 });
    expect(a).toBe(b);
  });

  it('should differ across seeds', () => {
    const a = renderPseudoBarcodeSvg({ seed: 'sku-a', width: 320, height: 80 });
    const b = renderPseudoBarcodeSvg({ seed: 'sku-b', width: 320, height: 80 });
    expect(a).not.toBe(b);
  });

  it('should use 320x80 dimensions in output', () => {
    const svg = renderPseudoBarcodeSvg({ seed: 'demo', width: 320, height: 80 });
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
    expect(svg).toContain('viewBox="0 0 100 25"');
  });

  it('should apply custom colors', () => {
    const svg = renderPseudoBarcodeSvg({
      seed: 'demo',
      width: 200,
      height: 60,
      colors: { dark: '#222222', light: '#fafafa' },
    });
    expect(svg).toContain('fill="#fafafa"');
    expect(svg).toContain('fill="#222222"');
  });

  it('should reject invalid hex in colors', () => {
    expect(() =>
      renderPseudoBarcodeSvg({
        seed: 'demo',
        width: 200,
        height: 60,
        colors: { dark: 'bad-hex' },
      }),
    ).toThrow(/Invalid color/);
  });

  it('should produce distinct ean13 guard layout', () => {
    const code128 = renderPseudoBarcodeSvg({
      seed: 'demo',
      width: 320,
      height: 80,
      variant: 'code128',
    });
    const ean13 = renderPseudoBarcodeSvg({
      seed: 'demo',
      width: 320,
      height: 80,
      variant: 'ean13',
    });
    expect(code128).not.toBe(ean13);
  });

  it('should parse variant query', () => {
    expect(parsePseudoBarcodeVariant(undefined)).toBe('code128');
    expect(parsePseudoBarcodeVariant('ean13')).toBe('ean13');
    expect(() => parsePseudoBarcodeVariant('upc')).toThrow(/variant/);
  });

  it('should expose module count', () => {
    expect(PSEUDO_BARCODE_MODULE_COUNT).toBe(95);
  });
});
