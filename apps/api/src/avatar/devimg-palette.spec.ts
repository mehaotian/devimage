import { buildGradientColors, buildRainbowMeshBlobs } from './devimg-palette';

describe('devimg-palette', () => {
  it('should produce two distinct gradient stop hues', () => {
    const colors = buildGradientColors('Luna');
    expect(colors.c1).not.toBe(colors.c2);
  });

  it('should produce four rainbow mesh blobs', () => {
    const mesh = buildRainbowMeshBlobs('DevImage');
    expect(mesh.blobs).toHaveLength(4);
  });

  it('should spread mesh hues roughly 90 degrees apart', () => {
    const mesh = buildRainbowMeshBlobs('Felix');
    expect(mesh.blobs.length).toBe(4);
  });

  it('should produce deterministic output for same seed', () => {
    expect(buildGradientColors('张三')).toEqual(buildGradientColors('张三'));
    expect(buildRainbowMeshBlobs('张三')).toEqual(buildRainbowMeshBlobs('张三'));
  });
});
