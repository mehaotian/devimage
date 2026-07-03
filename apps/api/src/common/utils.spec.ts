import { hslToHex, parseBoundedCount, parseRasterDimension, RASTER_MAX_DIMENSION } from './utils';

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

describe('parseBoundedCount', () => {
  it('should default when empty', () => {
    expect(parseBoundedCount(undefined, 10, 100)).toBe(10);
  });

  it('should reject invalid count', () => {
    expect(() => parseBoundedCount('abc', 10, 100)).toThrow('Invalid count');
  });
});

describe('parseRasterDimension', () => {
  it('should allow up to raster max', () => {
    expect(parseRasterDimension(RASTER_MAX_DIMENSION, 'size')).toBe(RASTER_MAX_DIMENSION);
  });

  it('should reject above raster max', () => {
    expect(() => parseRasterDimension(RASTER_MAX_DIMENSION + 1, 'size')).toThrow('raster max');
  });
});
