import { NativeAvatarService } from './native-avatar.service';

describe('NativeAvatarService', () => {
  let service: NativeAvatarService;

  beforeEach(() => {
    service = new NativeAvatarService();
  });

  it('should render devimg-gradient as clipped circle', () => {
    const svg = service.renderSvg({ style: 'devimg-gradient', seed: 'Felix-9on8', size: 128 });
    expect(svg).toContain('clipPath');
    expect(svg).toMatch(/stop-color="#[0-9a-f]{6}"/i);
    expect(svg).not.toContain('stroke="rgba(255,255,255');
  });

  it('should render devimg-mesh with multiple radial gradients', () => {
    const svg = service.renderSvg({ style: 'devimg-mesh', seed: 'Aneka-ngl2', size: 128 });
    expect(svg).toContain('clipPath');
    expect(svg.match(/<radialGradient id=/g)?.length).toBe(4);
    expect(svg).not.toContain('feGaussianBlur');
  });

  it('should render devimg-geo deterministically', () => {
    const a = service.renderSvg({ style: 'devimg-geo', seed: 'Felix', size: 64 });
    const b = service.renderSvg({ style: 'devimg-geo', seed: 'Felix', size: 64 });
    expect(a).toBe(b);
  });

  it('should render devimg-initials with chinese', () => {
    const svg = service.renderSvg({ style: 'devimg-initials', seed: '张三', size: 128 });
    expect(svg).toContain('张');
  });
});
