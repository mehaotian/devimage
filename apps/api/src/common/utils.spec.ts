import { hslToHex } from './utils';

describe('hslToHex', () => {
  it('should return 6-char hex', () => {
    expect(hslToHex(121, 68, 58)).toMatch(/^[0-9a-f]{6}$/);
    expect(hslToHex(0, 70, 55)).toMatch(/^[0-9a-f]{6}$/);
    expect(hslToHex(200, 30, 96)).toMatch(/^[0-9a-f]{6}$/);
  });

  it('should produce stable output for seed-like hues', () => {
    const a = hslToHex(121, 68, 58);
    const b = hslToHex(121, 68, 58);
    expect(a).toBe(b);
    expect(a).not.toHaveLength(12);
  });
});
