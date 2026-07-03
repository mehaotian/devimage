import { pickBarcodeQuery, resolveBarcodeRenderParams } from './barcode-query';

describe('barcode-query', () => {
  it('should pick only known query keys', () => {
    expect(
      pickBarcodeQuery({
        fg: '222222',
        bg: 'fafafa',
        variant: 'ean13',
      }),
    ).toEqual({
      fg: '222222',
      bg: 'fafafa',
      variant: 'ean13',
    });
  });

  it('should resolve colors and ean13 variant', () => {
    const params = resolveBarcodeRenderParams({
      fg: '1a1a1a',
      bg: 'ffffff',
      variant: 'ean13',
    });
    expect(params.colors.dark).toBe('#1a1a1a');
    expect(params.variant).toBe('ean13');
  });

  it('should default to code128', () => {
    expect(resolveBarcodeRenderParams({}).variant).toBe('code128');
  });
});
