import { BadRequestException } from '@nestjs/common';
import { BarcodeController } from './barcode.controller';
import { PseudoCodeRasterService } from './pseudo-code-raster.service';
import { BarcodeService } from './barcode.service';

describe('BarcodeService', () => {
  let service: BarcodeService;

  beforeEach(() => {
    service = new BarcodeService();
  });

  it('should render deterministically', () => {
    const a = service.renderSvg({ seed: 'sku-mock', width: 320, height: 80 });
    const b = service.renderSvg({ seed: 'sku-mock', width: 320, height: 80 });
    expect(a).toBe(b);
  });

  it('should reject invalid dimensions', () => {
    expect(() => service.renderSvg({ seed: 'demo', width: 5, height: 80 })).toThrow();
  });

  it('should support ean13 variant', () => {
    const code128 = service.renderSvg({
      seed: 'demo',
      width: 320,
      height: 80,
      query: { variant: 'code128' },
    });
    const ean13 = service.renderSvg({
      seed: 'demo',
      width: 320,
      height: 80,
      query: { variant: 'ean13' },
    });
    expect(code128).not.toBe(ean13);
  });
});

describe('BarcodeController', () => {
  let controller: BarcodeController;

  beforeEach(() => {
    controller = new BarcodeController(new BarcodeService(), {} as PseudoCodeRasterService);
  });

  it('should render svg for valid params', () => {
    const svg = controller.getPseudoBarcodeSvg('sku-mock', '320', '80', {});
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="320"');
  });

  it('should reject invalid variant', () => {
    expect(() =>
      controller.getPseudoBarcodeSvg('demo', '320', '80', { variant: 'invalid' }),
    ).toThrow(BadRequestException);
  });
});
