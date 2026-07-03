import { SceneService } from './scene.service';
import { parseOptionalDimension } from '../common/utils';

/** 从 SVG 提取排版 y 坐标 */
function extractLayoutY(svg: string): {
  titleTop: number;
  accentY: number;
  subtitleTop: number;
  titleSize: number;
  subSize: number;
  accentHeight: number;
} {
  return {
    titleTop: Number.parseFloat(
      /y="([\d.]+)" dominant-baseline="hanging"[^>]*font-weight="600"/.exec(svg)![1]!,
    ),
    accentY: Number.parseFloat(/y="([\d.]+)" width="[\d.]+"\s+height="([\d.]+)"/.exec(svg)![1]!),
    accentHeight: Number.parseFloat(
      /y="([\d.]+)" width="[\d.]+"\s+height="([\d.]+)"/.exec(svg)![2]!,
    ),
    subtitleTop: Number.parseFloat(
      /y="([\d.]+)" dominant-baseline="hanging"[^>]*letter-spacing="0.05em"/.exec(svg)![1]!,
    ),
    titleSize: Number.parseFloat(
      /font-size="([\d.]+)" font-weight="600"/.exec(svg)![1]!,
    ),
    subSize: Number.parseFloat(
      /font-size="([\d.]+)" letter-spacing="0.05em"/.exec(svg)![1]!,
    ),
  };
}

describe('SceneService', () => {
  let service: SceneService;

  beforeEach(() => {
    service = new SceneService();
  });

  it('should render 404 variant', () => {
    const svg = service.render('404', 800, 600);
    expect(svg).toContain('404');
    expect(svg).toContain('width="800"');
  });

  it('should use equal section gaps above and below accent', () => {
    const svg = service.render('empty', 480, 320, { theme: 'light' });
    const layout = extractLayoutY(svg);
    const gapAbove = layout.accentY - (layout.titleTop + layout.titleSize);
    const gapBelow = layout.subtitleTop - (layout.accentY + layout.accentHeight);

    expect(gapAbove).toBe(gapBelow);
    expect(gapAbove).toBeGreaterThanOrEqual(36);
  });

  it('should use identical layout coordinates for light and dark', () => {
    const light = extractLayoutY(service.render('empty', 480, 320, { theme: 'light' }));
    const dark = extractLayoutY(service.render('empty', 480, 320, { theme: 'dark' }));

    expect(dark.titleTop).toBe(light.titleTop);
    expect(dark.accentY).toBe(light.accentY);
    expect(dark.subtitleTop).toBe(light.subtitleTop);
    expect(dark.titleSize).toBe(light.titleSize);
    expect(dark.subSize).toBe(light.subSize);
  });

  it('should apply custom title and dark theme', () => {
    const svg = service.render('empty', 400, 300, {
      theme: 'dark',
      title: '空空如也',
      subtitle: '去别处看看',
    });
    expect(svg).toContain('空空如也');
    expect(svg).toContain('fill="#0f172a"');
  });

  it('should use seed palette when seed provided', () => {
    const a = service.render('404', 800, 600, { theme: 'light', seed: 'demo' });
    const b = service.render('404', 800, 600, { theme: 'light', seed: 'demo' });
    expect(a).toBe(b);
    expect(a).toContain('fill="#');
  });

  it('should use parseOptionalDimension defaults', () => {
    expect(parseOptionalDimension(undefined, 'width', 800)).toBe(800);
    expect(parseOptionalDimension('400', 'width', 800)).toBe(400);
  });
});
