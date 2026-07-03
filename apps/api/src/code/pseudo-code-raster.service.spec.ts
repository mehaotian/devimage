import { PseudoCodeRasterService } from './pseudo-code-raster.service';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';

describe('PseudoCodeRasterService', () => {
  it('should rasterize svg via shared pipeline', async () => {
    const rateLimit = {
      assertWithinLimit: jest.fn(),
    } as unknown as RasterRateLimitService;
    const service = new PseudoCodeRasterService(rateLimit);
    const buffer = await service.renderFromSvg(
      '127.0.0.1',
      64,
      64,
      () =>
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/></svg>',
      'png',
    );
    expect(rateLimit.assertWithinLimit).toHaveBeenCalledWith('127.0.0.1');
    expect(buffer.length).toBeGreaterThan(50);
  });

  it('should reject raster above max dimension', async () => {
    const service = new PseudoCodeRasterService({} as RasterRateLimitService);
    await expect(
      service.renderFromSvg(undefined, 1025, 64, () => '<svg></svg>', 'png'),
    ).rejects.toThrow(/raster max/);
  });
});
