import { parsePlaceholderRasterFormat } from './placeholder-query';

describe('parsePlaceholderRasterFormat', () => {
  it('should return null for empty format', () => {
    expect(parsePlaceholderRasterFormat(undefined)).toBeNull();
    expect(parsePlaceholderRasterFormat('svg')).toBeNull();
  });

  it('should parse webp and png', () => {
    expect(parsePlaceholderRasterFormat('webp')).toBe('webp');
    expect(parsePlaceholderRasterFormat('PNG')).toBe('png');
  });

  it('should return null for unknown format', () => {
    expect(parsePlaceholderRasterFormat('gif')).toBeNull();
  });
});
