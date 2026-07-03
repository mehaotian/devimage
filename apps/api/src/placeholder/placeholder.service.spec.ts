import { PlaceholderService } from './placeholder.service';
import { decodeRouteSeed } from '../common/text';

describe('PlaceholderService', () => {
  let service: PlaceholderService;

  beforeEach(() => {
    service = new PlaceholderService();
  });

  it('should render svg with dimensions', () => {
    const svg = service.renderSvg({
      width: 200,
      height: 100,
      text: '200×100',
      bg: 'cccccc',
      fg: '666666',
    });
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="100"');
    expect(svg).toContain('200×100');
    expect(svg).toContain('dy="0.35em"');
    expect(svg).not.toContain('dominant-baseline');
  });

  it('should produce deterministic colors for same seed', () => {
    const a = service.resolveOptions('800', '600', {}, 'demo');
    const b = service.resolveOptions('800', '600', {}, 'demo');
    expect(a.bg).toBe(b.bg);
    expect(a.fg).toBe(b.fg);
  });

  it('should treat encoded and decoded seed equally when decoded first', () => {
    const encoded = service.resolveOptions('200', '200', {}, decodeRouteSeed('%E5%BC%A0%E4%B8%89'));
    const plain = service.resolveOptions('200', '200', {}, '张三');
    expect(encoded.bg).toBe(plain.bg);
  });
});
