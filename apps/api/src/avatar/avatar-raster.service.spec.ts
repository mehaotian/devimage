import sharp from 'sharp';
import { AvatarRasterService } from './avatar-raster.service';
import { AvatarStyleService } from './avatar-style.service';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';

describe('AvatarRasterService', () => {
  let service: AvatarRasterService;
  let rateLimit: RasterRateLimitService;

  beforeEach(() => {
    rateLimit = new RasterRateLimitService();
    const avatarStyleService = {
      renderSvg: jest.fn().mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#6366f1"/></svg>',
      ),
    } as unknown as AvatarStyleService;

    service = new AvatarRasterService(avatarStyleService, rateLimit);
  });

  it('should render png buffer with png signature', async () => {
    const buffer = await service.renderRaster(
      { style: 'devimg', seed: '张三', size: 64 },
      'png',
    );

    expect(buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  });

  it('should render webp buffer with riff header', async () => {
    const buffer = await service.renderRaster(
      { style: 'devimg', seed: 'Luna', size: 64 },
      'webp',
    );

    expect(buffer.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(buffer.subarray(8, 12).toString('ascii')).toBe('WEBP');
  });

  it('should produce deterministic png for same options', async () => {
    const options = { style: 'devimg', seed: 'Felix', size: 128, raster: true };
    const a = await service.renderRaster(options, 'png');
    const b = await service.renderRaster(options, 'png');
    expect(a.equals(b)).toBe(true);
  });

  it('should reject raster size above max', async () => {
    await expect(
      service.renderRaster({ style: 'devimg', seed: 'Felix', size: 2048, raster: true }, 'png'),
    ).rejects.toThrow('raster max');
  });

  it('should keep initial text near vertical center when rasterized', async () => {
    const avatarStyleService = {
      renderSvg: jest.fn().mockReturnValue(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 100 100">',
          '<rect width="100" height="100" fill="#6366f1"/>',
          '<text x="50" y="50" text-anchor="middle" dy="0.35em" fill="#ffffff"',
          ' font-family="sans-serif" font-size="42" font-weight="600">A</text>',
          '</svg>',
        ].join(''),
      ),
    } as unknown as AvatarStyleService;
    const rasterService = new AvatarRasterService(avatarStyleService, rateLimit);
    const png = await rasterService.renderRaster(
      { style: 'devimg', seed: 'Aneka', size: 128 },
      'png',
    );

    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const alpha = data[i + 3];
      if (alpha > 200 && red > 200 && green > 200 && blue > 200) {
        const pixel = i / 4;
        sumX += pixel % info.width;
        sumY += Math.floor(pixel / info.width);
        count += 1;
      }
    }

    const centerX = info.width / 2;
    const centerY = info.height / 2;
    const textX = sumX / count;
    const textY = sumY / count;
    expect(Math.abs(textX - centerX)).toBeLessThan(2);
    expect(Math.abs(textY - centerY)).toBeLessThan(3);
  });
});
