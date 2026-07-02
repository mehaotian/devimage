import { AvatarStyleService } from './avatar-style.service';
import { NativeAvatarService } from './native-avatar.service';
import { DicebearAvatarService } from './dicebear-avatar.service';

describe('AvatarStyleService', () => {
  let service: AvatarStyleService;

  beforeEach(() => {
    service = new AvatarStyleService(
      new NativeAvatarService(),
      new DicebearAvatarService(),
    );
  });

  it('should list native and partner styles', () => {
    const styles = service.listStyles();
    expect(styles.some((item) => item.id === 'devimg-gradient')).toBe(true);
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
});
