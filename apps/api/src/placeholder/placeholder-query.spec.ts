import {
  parsePlaceholderRasterFormat,
  parseBorderWidth,
  parseCrossFlag,
  normalizePlaceholderQuery,
  resolvePlaceholderFields,
} from './placeholder-query';

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

describe('normalizePlaceholderQuery', () => {
  it('should merge alias fields', () => {
    expect(
      normalizePlaceholderQuery({ t: 'Hi', bc: 'eee', tc: '333' }),
    ).toEqual({
      text: 'Hi',
      bg: 'eee',
      fg: '333',
      format: undefined,
      border: undefined,
      borderColor: undefined,
      cross: undefined,
      style: undefined,
      pattern: undefined,
    });
  });
});

describe('parseBorderWidth', () => {
  it('should parse border widths', () => {
    expect(parseBorderWidth(undefined)).toBe(0);
    expect(parseBorderWidth('1')).toBe(2);
    expect(parseBorderWidth('4')).toBe(4);
  });
});

describe('parseCrossFlag', () => {
  it('should parse cross flag', () => {
    expect(parseCrossFlag('1')).toBe(true);
    expect(parseCrossFlag(undefined)).toBe(false);
  });
});

describe('resolvePlaceholderFields', () => {
  it('should prefer path colors over query', () => {
    const fields = resolvePlaceholderFields(
      normalizePlaceholderQuery({ bg: '111', fg: '222' }),
      'eee',
      'fff',
    );
    expect(fields.bg).toBe('eee');
    expect(fields.fg).toBe('fff');
  });
});

