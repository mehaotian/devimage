import { NativeAvatarService } from './native-avatar.service';

describe('NativeAvatarService', () => {
  let service: NativeAvatarService;

  beforeEach(() => {
    service = new NativeAvatarService();
  });

  it('should render devimg canonical with default gradient and text', () => {
    const svg = service.renderSvg({ style: 'devimg', seed: '张三', size: 128 });
    expect(svg).toContain('clipPath');
    expect(svg).toContain('张');
    expect(svg).toMatch(/stop-color="#[0-9a-f]{6}"/i);
  });

  it('should render devimg with mesh variant and no text', () => {
    const svg = service.renderSvg({
      style: 'devimg',
      seed: 'Luna',
      size: 128,
      variant: 'mesh',
      text: '0',
    });
    expect(svg).toContain('clipPath');
    expect(svg.match(/<radialGradient id=/g)?.length).toBe(4);
    expect(svg).not.toContain('<text');
  });

  it('should render devimg-gradient alias without text', () => {
    const svg = service.renderSvg({ style: 'devimg-gradient', seed: 'Felix-9on8', size: 128 });
    expect(svg).toContain('clipPath');
    expect(svg).not.toContain('<text');
  });

  it('should render devimg-mesh alias without text', () => {
    const svg = service.renderSvg({ style: 'devimg-mesh', seed: 'Aneka-ngl2', size: 128 });
    expect(svg.match(/<radialGradient id=/g)?.length).toBe(4);
    expect(svg).not.toContain('<text');
  });

  it('should render devimg-initials alias with text', () => {
    const svg = service.renderSvg({ style: 'devimg-initials', seed: '张三', size: 128 });
    expect(svg).toContain('张');
  });

  it('should apply custom bg and fg on devimg', () => {
    const svg = service.renderSvg({
      style: 'devimg',
      seed: '张三',
      size: 128,
      bg: '6366f1',
      fg: 'ffffff',
    });
    expect(svg).toContain('fill="#6366f1"');
    expect(svg).toContain('fill="#ffffff"');
  });

  it('should reject invalid variant', () => {
    expect(() =>
      service.renderSvg({ style: 'devimg', seed: 'x', size: 64, variant: 'geo' }),
    ).toThrow('Invalid variant');
  });

  it('should reject invalid shape', () => {
    expect(() =>
      service.renderSvg({ style: 'devimg', seed: 'x', size: 64, shape: 'triangle' }),
    ).toThrow('Invalid shape');
  });

  it('should render square devimg without circle clip', () => {
    const svg = service.renderSvg({
      style: 'devimg',
      seed: 'Luna',
      size: 128,
      shape: 'square',
      text: '0',
    });
    expect(svg).not.toContain('clipPath');
  });

  it('should render circle devimg with clip', () => {
    const svg = service.renderSvg({
      style: 'devimg',
      seed: 'Luna',
      size: 128,
      text: '0',
    });
    expect(svg).toContain('clipPath');
  });

  it('should render devimg-geo deterministically', () => {
    const a = service.renderSvg({ style: 'devimg-geo', seed: 'Felix', size: 64 });
    const b = service.renderSvg({ style: 'devimg-geo', seed: 'Felix', size: 64 });
    expect(a).toBe(b);
  });

  it('should render devimg-pattern with svg pattern tile', () => {
    const svg = service.renderSvg({ style: 'devimg-pattern', seed: 'Luna', size: 128 });
    expect(svg).toContain('clipPath');
    expect(svg).toContain('<pattern id="pat"');
    expect(svg).not.toContain('<text');
  });

  it('should render devimg with pattern variant and optional text', () => {
    const svg = service.renderSvg({
      style: 'devimg',
      seed: '张三',
      size: 128,
      variant: 'pattern',
      pattern: 'polka',
      text: '1',
    });
    expect(svg).toContain('<pattern id="pat"');
    expect(svg).toContain('张');
  });

  it('should reject bg on pattern variant', () => {
    expect(() =>
      service.renderSvg({
        style: 'devimg-pattern',
        seed: 'Luna',
        size: 64,
        bg: '6366f1',
      }),
    ).toThrow('bg is not supported with pattern');
  });
});
