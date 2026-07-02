import { DicebearAvatarService } from './dicebear-avatar.service';

describe('DicebearAvatarService', () => {
  let service: DicebearAvatarService;

  beforeEach(() => {
    service = new DicebearAvatarService();
  });

  it('should recognize partner style rings', () => {
    expect(service.isKnownStyle('rings')).toBe(true);
    expect(service.isKnownStyle('devimg-gradient')).toBe(false);
  });

  it('should render rings svg with size', () => {
    const svg = service.renderSvg({ style: 'rings', seed: 'Luna', size: 128 });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="128"');
  });

  it('should produce deterministic output for same seed', () => {
    const a = service.renderSvg({ style: 'rings', seed: 'Felix', size: 64 });
    const b = service.renderSvg({ style: 'rings', seed: 'Felix', size: 64 });
    expect(a).toBe(b);
  });

  it('should reject non-partner style', () => {
    expect(() =>
      service.renderSvg({ style: 'devimg-geo', seed: 'x', size: 64 }),
    ).toThrow('Not a partner style');
  });
});
