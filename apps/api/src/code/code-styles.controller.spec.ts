import { CODE_STYLES_CATALOG, formatCodeVariantLabel } from './code-styles.catalog';
import { CodeStylesController } from './code-styles.controller';

describe('code-styles.catalog', () => {
  it('should expose qr and barcode variants', () => {
    expect(CODE_STYLES_CATALOG.qr.variants.length).toBe(3);
    expect(CODE_STYLES_CATALOG.barcode.variants.length).toBe(2);
  });

  it('should format playground labels', () => {
    expect(formatCodeVariantLabel(CODE_STYLES_CATALOG.qr.variants[0]!)).toContain('matrix');
    expect(formatCodeVariantLabel(CODE_STYLES_CATALOG.barcode.variants[1]!)).toContain('ean13');
  });
});

describe('CodeStylesController', () => {
  it('should return catalog json', () => {
    const controller = new CodeStylesController();
    expect(controller.listStyles()).toEqual(CODE_STYLES_CATALOG);
  });
});
