import { PlaceholderRasterService } from './placeholder-raster.service';
import { PlaceholderService } from './placeholder.service';
import { RasterRateLimitService } from '../common/raster-rate-limit.service';

describe('PlaceholderRasterService', () => {
  let service: PlaceholderRasterService;

  beforeEach(() => {
    const placeholderService = new PlaceholderService();
    service = new PlaceholderRasterService(placeholderService, new RasterRateLimitService());
  });

  it('should render webp buffer', async () => {
    const buffer = await service.renderRaster(
      {
        width: 200,
        height: 100,
        text: '200×100',
        bg: 'cccccc',
        fg: '666666',
      },
      'webp',
    );
    expect(buffer.subarray(0, 4).toString('ascii')).toBe('RIFF');
  });

  it('should reject raster dimension above max', async () => {
    await expect(
      service.renderRaster(
        { width: 2000, height: 100, text: 'x', bg: 'cccccc', fg: '666666' },
        'png',
      ),
    ).rejects.toThrow('raster max');
  });
});
