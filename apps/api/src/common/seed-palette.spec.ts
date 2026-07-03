import { resolveSeedPalette } from './seed-palette';

describe('resolveSeedPalette', () => {
  it('should return deterministic palette for same seed', () => {
    const a = resolveSeedPalette('demo');
    const b = resolveSeedPalette('demo');
    expect(a).toEqual(b);
  });

  it('should return hex colors without hash', () => {
    const palette = resolveSeedPalette('demo');
    expect(palette.accent).toMatch(/^[0-9a-f]{6}$/);
    expect(palette.bgLight).toMatch(/^[0-9a-f]{6}$/);
  });

  it('should differ across seeds', () => {
    const a = resolveSeedPalette('demo');
    const b = resolveSeedPalette('checkout');
    expect(a.accent).not.toBe(b.accent);
  });
});
