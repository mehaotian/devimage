import { AvatarStyleService } from './avatar-style.service';
import { NativeAvatarService } from './native-avatar.service';
import { DicebearAvatarService } from './dicebear-avatar.service';
import { JdenticonAvatarService } from './jdenticon-avatar.service';
import { MinidenticonsAvatarService } from './minidenticons-avatar.service';

describe('AvatarStyleService', () => {
  let service: AvatarStyleService;

  beforeEach(() => {
    service = new AvatarStyleService(
      new NativeAvatarService(),
      new DicebearAvatarService(),
      new JdenticonAvatarService(),
      new MinidenticonsAvatarService(),
    );
  });

  it('should list native and partner styles', () => {
    const styles = service.listStyles();
    expect(styles.some((item) => item.id === 'devimg')).toBe(true);
    expect(styles.some((item) => item.id === 'rings')).toBe(true);
    expect(styles.some((item) => item.engine === 'native')).toBe(true);
  });

  it('should render native style', () => {
    const svg = service.renderSvg({
      style: 'devimg-mesh',
      seed: 'demo',
      size: 128,
    });
    expect(svg).toContain('<svg');
  });

  it('should render partner style', () => {
    const svg = service.renderSvg({
      style: 'rings',
      seed: 'Luna',
      size: 128,
    });
    expect(svg).toContain('width="128"');
  });

  it('should render jdenticon partner style', () => {
    const svg = service.renderSvg({
      style: 'jdenticon',
      seed: 'Felix',
      size: 128,
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="128"');
  });

  it('should render minidenticon partner style', () => {
    const svg = service.renderSvg({
      style: 'minidenticon',
      seed: 'Felix',
      size: 128,
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="128"');
  });

  it('should render devimg-initials with custom bg/fg', () => {
    const svg = service.renderSvg({
      style: 'devimg-initials',
      seed: '张三',
      size: 128,
      bg: '6366f1',
      fg: 'ffffff',
    });
    expect(svg).toContain('#6366f1');
    expect(svg).toContain('#ffffff');
  });

  it('should render devimg canonical equivalent to initials alias', () => {
    const canonical = service.renderSvg({
      style: 'devimg',
      seed: '张三',
      size: 128,
    });
    const alias = service.renderSvg({
      style: 'devimg-initials',
      seed: '张三',
      size: 128,
    });
    expect(canonical).toBe(alias);
  });
});
