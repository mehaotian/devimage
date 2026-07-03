import { parseQueryFgBg, parseQueryFgBgAccent } from './pseudo-code-colors';

describe('pseudo-code-colors', () => {
  it('should parse fg and bg hex', () => {
    const colors = parseQueryFgBg('111111', 'eeeeee', { fg: '000000', bg: 'ffffff' });
    expect(colors.dark).toBe('#111111');
    expect(colors.light).toBe('#eeeeee');
  });

  it('should expand 3-digit hex', () => {
    const colors = parseQueryFgBg('abc', 'def', { fg: '000000', bg: 'ffffff' });
    expect(colors.dark).toBe('#aabbcc');
    expect(colors.light).toBe('#ddeeff');
  });

  it('should parse accent for qr', () => {
    const colors = parseQueryFgBgAccent('111111', 'eeeeee', 'ff0000', {
      fg: '000000',
      bg: 'ffffff',
      accent: '6366f1',
    });
    expect(colors.accent).toBe('#ff0000');
  });

  it('should reject invalid hex', () => {
    expect(() => parseQueryFgBg('gggggg', undefined, { fg: '000000', bg: 'ffffff' })).toThrow(
      /Invalid color/,
    );
  });
});
