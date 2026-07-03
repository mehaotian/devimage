import { decodeRouteSeed, extractInitialChar } from './text';

describe('extractInitialChar', () => {
  it('should extract Chinese first character', () => {
    expect(extractInitialChar('张三')).toBe('张');
  });

  it('should uppercase Latin initial', () => {
    expect(extractInitialChar('luna')).toBe('L');
  });

  it('should return ? for empty input', () => {
    expect(extractInitialChar('   ')).toBe('?');
  });
});

describe('decodeRouteSeed', () => {
  it('should decode percent-encoded Chinese', () => {
    expect(decodeRouteSeed('%E5%BC%A0%E4%B8%89')).toBe('张三');
  });

  it('should pass through plain seed', () => {
    expect(decodeRouteSeed('Luna')).toBe('Luna');
  });
});
