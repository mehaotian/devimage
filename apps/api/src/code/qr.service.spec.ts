import { BadRequestException } from '@nestjs/common';
import { QrController } from './qr.controller';
import { PseudoCodeRasterService } from './pseudo-code-raster.service';
import { QrService } from './qr.service';

describe('QrService', () => {
  let service: QrService;

  beforeEach(() => {
    service = new QrService();
  });

  it('should render deterministically for the same seed', () => {
    const a = service.renderSvg({ seed: 'demo', width: 128 });
    const b = service.renderSvg({ seed: 'demo', width: 128 });
    expect(a).toBe(b);
  });

  it('should reject invalid size', () => {
    expect(() => service.renderSvg({ seed: 'demo', width: 5 })).toThrow();
  });

  it('should apply fg/bg query colors', () => {
    const svg = service.renderSvg({
      seed: 'demo',
      width: 64,
      query: { fg: '111111', bg: 'eeeeee' },
    });
    expect(svg).toContain('fill="#eeeeee"');
    expect(svg).toContain('fill="#111111"');
  });

  it('should support rectangular dimensions', () => {
    const svg = service.renderSvg({ seed: 'demo', width: 320, height: 80 });
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });

  it('should support dots variant', () => {
    const svg = service.renderSvg({
      seed: 'demo',
      width: 128,
      query: { variant: 'dots' },
    });
    expect(svg).toContain('<circle');
  });

  it('should reject invalid variant', () => {
    expect(() =>
      service.renderSvg({ seed: 'demo', width: 128, query: { variant: 'invalid' } }),
    ).toThrow(/variant/);
  });
});

describe('QrController', () => {
  let controller: QrController;

  beforeEach(() => {
    const service = new QrService();
    controller = new QrController(service, {} as PseudoCodeRasterService);
  });

  it('should render square svg for valid seed', () => {
    const svg = controller.getPseudoQrSquareSvg('demo', '128', {});
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="128"');
  });

  it('should render rectangular svg', () => {
    const svg = controller.getPseudoQrRectSvg('demo', '320', '80', {});
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });

  it('should reject empty seed', () => {
    expect(() => controller.getPseudoQrSquareSvg('%20', '128', {})).toThrow(BadRequestException);
  });

  it('should reject invalid size', () => {
    expect(() => controller.getPseudoQrSquareSvg('demo', '99999', {})).toThrow(BadRequestException);
  });
});
