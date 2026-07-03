import { PSEUDO_MATRIX_MODULE_COUNT, renderPseudoMatrixSvg } from './pseudo-matrix';

describe('pseudo-matrix', () => {
  it('should render deterministically for the same seed', () => {
    const a = renderPseudoMatrixSvg({ seed: 'demo', width: 128 });
    const b = renderPseudoMatrixSvg({ seed: 'demo', width: 128 });
    expect(a).toBe(b);
  });

  it('should differ across seeds', () => {
    const a = renderPseudoMatrixSvg({ seed: 'demo', width: 128 });
    const b = renderPseudoMatrixSvg({ seed: 'checkout', width: 128 });
    expect(a).not.toBe(b);
  });

  it('should include finder patterns in matrix variant', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 256, variant: 'matrix' });
    expect(svg).toContain('viewBox="0 0 100 100"');
    expect(svg).toContain('width="256"');
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThan(20);
  });

  it('should support rectangular output with letterboxing', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 320, height: 80 });
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
    expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it('should render dots variant with circles', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'dots' });
    expect(svg).toContain('<circle');
  });

  it('should include finder patterns in dots variant', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'dots' });
    const finderOuter = (7 * 100) / 21;
    expect(svg).toContain(`width="${finderOuter.toFixed(3)}"`);
  });

  it('should not embed seed text in svg markup', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'secret-payload-xyz', width: 128 });
    expect(svg).not.toContain('secret-payload');
  });

  it('should reject invalid hex in colors', () => {
    expect(() =>
      renderPseudoMatrixSvg({
        seed: 'demo',
        width: 64,
        colors: { dark: 'not-a-color' },
      }),
    ).toThrow(/Invalid color/);
  });

  it('should render minimal variant without overlapping matrix layout', () => {
    const matrix = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'matrix' });
    const minimal = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'minimal' });
    expect(matrix).not.toBe(minimal);
  });

  it('should apply radius to data modules', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 64, radius: 30 });
    expect(svg).toContain('rx="');
  });

  it('should apply custom colors when provided', () => {
    const svg = renderPseudoMatrixSvg({
      seed: 'demo',
      width: 64,
      colors: { dark: '#111111', light: '#eeeeee', accent: '#ff0000' },
    });
    expect(svg).toContain('fill="#eeeeee"');
    expect(svg).toContain('fill="#111111"');
  });

  it('should expose module count for layout tests', () => {
    expect(PSEUDO_MATRIX_MODULE_COUNT).toBe(21);
  });

  it('should render three finder corners in matrix variant', () => {
    const svg = renderPseudoMatrixSvg({ seed: 'demo', width: 128, variant: 'matrix' });
    const finderOuter = ((7 * 100) / 21).toFixed(3);
    const matches = svg.match(new RegExp(`width="${finderOuter}"`, 'g')) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });
});
