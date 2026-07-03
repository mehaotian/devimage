import { SceneService } from './scene.service';
import { parseOptionalDimension } from '../common/utils';

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

  it('should use parseOptionalDimension defaults', () => {
    expect(parseOptionalDimension(undefined, 'width', 800)).toBe(800);
    expect(parseOptionalDimension('400', 'width', 800)).toBe(400);
  });
});
