import { rasterizeValidatedSvg } from './svg-raster-route';
import { RasterRateLimitService } from './raster-rate-limit.service';

describe('svg-raster-route', () => {
  it('should enforce raster rate limit when client ip provided', async () => {
    const rateLimit = {
      assertWithinLimit: jest.fn(),
    } as unknown as RasterRateLimitService;

    await rasterizeValidatedSvg(
      rateLimit,
      '10.0.0.1',
      32,
      32,
      () =>
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#000"/></svg>',
      'png',
    );

    expect(rateLimit.assertWithinLimit).toHaveBeenCalledWith('10.0.0.1');
  });

  it('should skip rate limit without client ip', async () => {
    const rateLimit = {
      assertWithinLimit: jest.fn(),
    } as unknown as RasterRateLimitService;

    await rasterizeValidatedSvg(rateLimit, undefined, 32, 32, () =>
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#000"/></svg>',
      'png',
    );
    expect(rateLimit.assertWithinLimit).not.toHaveBeenCalled();
  });
});
