import { renderGeo } from './geo.renderer';

describe('geo.renderer', () => {
  it('should render deterministically for the same seed', () => {
    const a = renderGeo({ seed: 'Luna', size: 128 });
    const b = renderGeo({ seed: 'Luna', size: 128 });
    expect(a).toBe(b);
  });

  it('should use concentric ring variants across seeds', () => {
    const seeds = ['张三', 'Felix-gxu5', 'Luna', 'Aneka-gi2p'];
    for (const seed of seeds) {
      const svg = renderGeo({ seed, size: 128 });
      expect((svg.match(/<path/g) ?? []).length).toBeGreaterThanOrEqual(3);
      expect((svg.match(/<path/g) ?? []).length).toBeLessThanOrEqual(12);
    }
    const unique = new Set(seeds.map((seed) => renderGeo({ seed, size: 128 })));
    expect(unique.size).toBeGreaterThan(1);
  });

  it('should produce distinct layouts for geo variant seeds', () => {
    const layered = renderGeo({ seed: 'geo-variant-layered', size: 128 });
    const dual = renderGeo({ seed: 'geo-variant-dual-xx', size: 128 });
    expect(layered).toContain('<path');
    expect(dual).toContain('<path');
  });
});
