import { renderMatrix } from '../avatar/native-renderers/matrix.renderer';
import { QrService } from './qr.service';

describe('pseudo-code integration', () => {
  it('should align /qr output with devimg-matrix core for same seed', () => {
    const qrService = new QrService();
    const qrSvg = qrService.renderSvg({ seed: 'demo', width: 128 });
    const matrixSvg = renderMatrix({ seed: 'demo', size: 128 });
    expect(qrSvg).toBe(matrixSvg);
  });

  it('should differ when qr uses non-default variant', () => {
    const qrService = new QrService();
    const matrixSvg = renderMatrix({ seed: 'demo', size: 128 });
    const minimalSvg = qrService.renderSvg({
      seed: 'demo',
      width: 128,
      query: { variant: 'minimal' },
    });
    expect(minimalSvg).not.toBe(matrixSvg);
  });
});
