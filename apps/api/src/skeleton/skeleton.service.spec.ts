import { Test, TestingModule } from '@nestjs/testing';
import { SkeletonService } from './skeleton.service';

describe('SkeletonService', () => {
  let service: SkeletonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkeletonService],
    }).compile();
    service = module.get(SkeletonService);
  });

  it('should render page skeleton with dimensions', () => {
    const svg = service.renderSvg(
      service.resolveOptions('375', '812', 'page', 'light', 3, false),
    );
    expect(svg).toContain('width="375"');
    expect(svg).toContain('height="812"');
    expect(svg).toContain('#f1f5f9');
  });

  it('should render dark theme blocks', () => {
    const svg = service.renderSvg(
      service.resolveOptions('300', '64', 'row', 'dark', 3, false),
    );
    expect(svg).toContain('#0f172a');
    expect(svg).toContain('<circle');
  });

  it('should render grid with multiple cells', () => {
    const svg = service.renderSvg(
      service.resolveOptions('800', '600', 'grid', 'light', 3, false),
    );
    const rects = svg.match(/<rect/g) ?? [];
    expect(rects.length).toBeGreaterThan(3);
  });

  it('should include shimmer overlay when animate', () => {
    const svg = service.renderSvg(
      service.resolveOptions('350', '120', 'card', 'light', 3, true),
    );
    expect(svg).toContain('sk-shimmer');
  });

  it('should be deterministic for same options', () => {
    const opts = service.resolveOptions('400', '300', 'card', 'light', 3, false);
    expect(service.renderSvg(opts)).toBe(service.renderSvg(opts));
  });
});
