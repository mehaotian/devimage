import { HttpException } from '@nestjs/common';
import { RasterRateLimitService } from './raster-rate-limit.service';

describe('RasterRateLimitService', () => {
  let service: RasterRateLimitService;

  beforeEach(() => {
    service = new RasterRateLimitService();
  });

  it('should allow requests within limit', () => {
    expect(() => service.assertWithinLimit('127.0.0.1')).not.toThrow();
  });

  it('should reject when limit exceeded', () => {
    for (let i = 0; i < 60; i += 1) {
      service.assertWithinLimit('test-ip');
    }
    expect(() => service.assertWithinLimit('test-ip')).toThrow(HttpException);
  });
});
