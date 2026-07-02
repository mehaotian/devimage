import {
  buildPatternContext,
  buildPatternCatalog,
  DEVIMG_PATTERN_IDS,
  isDevimgPatternId,
  PATTERN_GROUPS,
  renderDevimgPattern,
} from './devimg-patterns/index';

describe('devimg-patterns', () => {
  it('should expose 39 p3 pattern templates in groups', () => {
    expect(DEVIMG_PATTERN_IDS).toHaveLength(39);
    expect(PATTERN_GROUPS).toHaveLength(6);
    expect(PATTERN_GROUPS.flatMap((group) => group.patterns)).toEqual([...DEVIMG_PATTERN_IDS]);
  });

  it('should build pattern catalog for API', () => {
    const catalog = buildPatternCatalog();
    expect(catalog.count).toBe(39);
    expect(catalog.groups).toHaveLength(6);
    expect(catalog.groups[5]?.id).toBe('symbol');
  });

  it('should include c3 accent color in pattern context', () => {
    const ctx = buildPatternContext('Luna', 'starry-night');
    expect(ctx.c3).toMatch(/^[0-9a-f]{6}$/i);
    expect(ctx.c3).not.toBe(ctx.c1);
  });

  it('should pick pattern deterministically from seed', () => {
    const a = buildPatternContext('Luna');
    const b = buildPatternContext('Luna');
    expect(a).toEqual(b);
    expect(DEVIMG_PATTERN_IDS).toContain(a.patternId);
  });

  it('should honor pattern override', () => {
    const ctx = buildPatternContext('Luna', 'yin-yang');
    expect(ctx.patternId).toBe('yin-yang');
  });

  it('should reject invalid pattern id', () => {
    expect(isDevimgPatternId('tartan')).toBe(false);
    expect(isDevimgPatternId('quatrefoil')).toBe(true);
    expect(isDevimgPatternId('starry-night')).toBe(true);
  });

  it('should render valid svg pattern layers', () => {
    for (const patternId of DEVIMG_PATTERN_IDS) {
      const { defs, body } = renderDevimgPattern('Felix', patternId);
      expect(defs).toContain('<pattern id="pat"');
      expect(body).toContain('fill="url(#pat)"');
      expect(defs).toMatch(/fill="#[0-9a-f]{6}"|stroke="#[0-9a-f]{6}"/i);
    }
  });
});
