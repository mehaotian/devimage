import {
  buildPatternContext,
  buildPatternCatalog,
  DEVIMG_PATTERN_IDS,
  isDevimgPatternId,
  PATTERN_GROUPS,
  renderDevimgPattern,
} from './devimg-patterns/index';

describe('devimg-patterns', () => {
  it('should expose 43 pattern templates in groups', () => {
    expect(DEVIMG_PATTERN_IDS).toHaveLength(43);
    expect(PATTERN_GROUPS).toHaveLength(7);
    expect(PATTERN_GROUPS.flatMap((group) => group.patterns)).toEqual([...DEVIMG_PATTERN_IDS]);
  });

  it('should build pattern catalog for API', () => {
    const catalog = buildPatternCatalog();
    expect(catalog.count).toBe(43);
    expect(catalog.groups).toHaveLength(7);
    expect(catalog.groups[6]?.id).toBe('premium');
  });

  it('should include c3 and c4 in pattern context', () => {
    const ctx = buildPatternContext('Luna', 'tartan');
    expect(ctx.c3).toMatch(/^[0-9a-f]{6}$/i);
    expect(ctx.c4).toMatch(/^[0-9a-f]{6}$/i);
  });

  it('should pick pattern deterministically from seed', () => {
    const a = buildPatternContext('Luna');
    const b = buildPatternContext('Luna');
    expect(a).toEqual(b);
    expect(DEVIMG_PATTERN_IDS).toContain(a.patternId);
  });

  it('should honor pattern override', () => {
    const ctx = buildPatternContext('Luna', 'plaid');
    expect(ctx.patternId).toBe('plaid');
  });

  it('should reject invalid pattern id', () => {
    expect(isDevimgPatternId('tartan-fake')).toBe(false);
    expect(isDevimgPatternId('gingham')).toBe(true);
    expect(isDevimgPatternId('madras')).toBe(true);
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
