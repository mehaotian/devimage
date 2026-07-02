import {
  buildPatternContext,
  DEVIMG_PATTERN_IDS,
  isDevimgPatternId,
  renderDevimgPattern,
} from './devimg-patterns';

describe('devimg-patterns', () => {
  it('should pick pattern deterministically from seed', () => {
    const a = buildPatternContext('Luna');
    const b = buildPatternContext('Luna');
    expect(a).toEqual(b);
    expect(DEVIMG_PATTERN_IDS).toContain(a.patternId);
  });

  it('should honor pattern override', () => {
    const ctx = buildPatternContext('Luna', 'polka');
    expect(ctx.patternId).toBe('polka');
  });

  it('should reject invalid pattern id', () => {
    expect(isDevimgPatternId('tartan')).toBe(false);
    expect(isDevimgPatternId('stripes')).toBe(true);
  });

  it('should render valid svg pattern layers', () => {
    for (const patternId of DEVIMG_PATTERN_IDS) {
      const { defs, body } = renderDevimgPattern('Felix', patternId);
      expect(defs).toContain('<pattern id="pat"');
      expect(body).toContain('fill="url(#pat)"');
      expect(defs).toMatch(/fill="#[0-9a-f]{6}"/i);
    }
  });
});
