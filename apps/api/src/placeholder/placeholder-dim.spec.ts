import { parseDimSpec, isDimSpecSegment } from './placeholder-dim';

describe('parseDimSpec', () => {
  it('should parse 800x600', () => {
    const result = parseDimSpec('800x600');
    expect(result).toEqual({ width: 800, height: 600, format: null });
  });

  it('should parse with svg suffix', () => {
    const result = parseDimSpec('400x300.svg');
    expect(result).toEqual({ width: 400, height: 300, format: null });
  });

  it('should parse with webp suffix', () => {
    const result = parseDimSpec('400x300.webp');
    expect(result).toEqual({ width: 400, height: 300, format: 'webp' });
  });

  it('should reject invalid spec', () => {
    expect(() => parseDimSpec('800/600')).toThrow(/Invalid dimensions/);
    expect(() => parseDimSpec('avatar')).toThrow(/Invalid dimensions/);
  });

  it('should reject out of range dimensions', () => {
    expect(() => parseDimSpec('5x600')).toThrow(/between 10 and 4000/);
  });
});

describe('isDimSpecSegment', () => {
  it('should detect dim spec segments', () => {
    expect(isDimSpecSegment('800x600')).toBe(true);
    expect(isDimSpecSegment('800x600.webp')).toBe(true);
    expect(isDimSpecSegment('health')).toBe(false);
    expect(isDimSpecSegment('800/600')).toBe(false);
  });
});
