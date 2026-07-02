import {
  EXPERIMENTAL_NATIVE_RENDERERS,
  renderExperimentalNative,
} from './index';

const EXPERIMENTAL_STYLE_IDS = Object.keys(EXPERIMENTAL_NATIVE_RENDERERS);

describe('Experimental native renderers', () => {
  it.each(EXPERIMENTAL_STYLE_IDS)('should render %s deterministically', (styleId) => {
    const a = renderExperimentalNative(styleId, 'Luna', 128);
    const b = renderExperimentalNative(styleId, 'Luna', 128);
    expect(a).toBe(b);
    expect(a).toContain('<svg');
    expect(a).toContain('width="128"');
  });

  it('should produce different output for different seeds', () => {
    const a = renderExperimentalNative('devimg-mandala', 'Alice', 64);
    const b = renderExperimentalNative('devimg-mandala', 'Bob', 64);
    expect(a).not.toBe(b);
  });

  it('should render devimg-hash with hex label', () => {
    const svg = renderExperimentalNative('devimg-hash', 'demo', 128);
    expect(svg).toMatch(/font-family="ui-monospace,monospace"/);
  });

  it('should render devimg-radical with text for Chinese seed', () => {
    const svg = renderExperimentalNative('devimg-radical', '张三', 128);
    expect(svg).toContain('张');
    expect(svg).toContain('<pattern id="pat"');
  });

  it('should render devimg-matrix with finder modules', () => {
    const svg = renderExperimentalNative('devimg-matrix', 'demo', 128);
    expect(svg.match(/<rect/g)?.length).toBeGreaterThan(20);
    expect(svg).toContain('fill="#');
  });

  it('should produce distinct matrix patterns for different seeds', () => {
    const a = renderExperimentalNative('devimg-matrix', 'Alice', 128);
    const b = renderExperimentalNative('devimg-matrix', 'Bob', 128);
    expect(a).not.toBe(b);
  });

  it('should produce distinct glass layouts for different seeds', () => {
    const a = renderExperimentalNative('devimg-glass', 'Alice', 128);
    const b = renderExperimentalNative('devimg-glass', 'Bob', 128);
    expect(a).not.toBe(b);
  });

  it('should produce distinct neon and paper for different seeds', () => {
    expect(renderExperimentalNative('devimg-neon', 'Alice', 128)).not.toBe(
      renderExperimentalNative('devimg-neon', 'Bob', 128),
    );
    expect(renderExperimentalNative('devimg-paper', 'Alice', 128)).not.toBe(
      renderExperimentalNative('devimg-paper', 'Bob', 128),
    );
  });

  it('should render paper with crisp layers without blur filter', () => {
    const svg = renderExperimentalNative('devimg-paper', 'Luna', 128);
    expect(svg).toContain('shape-rendering="geometricPrecision"');
    expect(svg).not.toContain('feGaussianBlur');
    expect(svg).not.toContain('paper-sh-');
  });

  it('should render filter styles with filter defs', () => {
    const svg = renderExperimentalNative('devimg-neon', 'Luna', 128);
    expect(svg).toContain('<filter id="neon-outer-a"');
    expect(svg).toContain('stroke-width="1.');
  });

  it('should render glass with frosted card and blur filter', () => {
    const svg = renderExperimentalNative('devimg-glass', 'Luna', 128);
    expect(svg).toContain('glass-heavy-blur');
    expect(svg).toContain('glass-clip-');
  });

  it('should throw for unknown style', () => {
    expect(() => renderExperimentalNative('devimg-unknown', 'x', 64)).toThrow(
      'Unknown experimental native style',
    );
  });
});
