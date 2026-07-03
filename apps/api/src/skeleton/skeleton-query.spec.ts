import { parseSkeletonCols, parseSkeletonTheme, parseSkeletonType } from './skeleton-query';

describe('skeleton-query', () => {
  it('should parse type', () => {
    expect(parseSkeletonType('row')).toBe('row');
    expect(parseSkeletonType(undefined)).toBe('page');
  });

  it('should reject invalid type', () => {
    expect(() => parseSkeletonType('invalid')).toThrow(/Invalid type/);
  });

  it('should parse theme', () => {
    expect(parseSkeletonTheme('dark')).toBe('dark');
    expect(parseSkeletonTheme(undefined)).toBe('light');
  });

  it('should parse cols', () => {
    expect(parseSkeletonCols('4')).toBe(4);
    expect(parseSkeletonCols(undefined)).toBe(3);
  });
});
