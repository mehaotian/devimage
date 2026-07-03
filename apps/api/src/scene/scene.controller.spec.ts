import { BadRequestException } from '@nestjs/common';
import { SceneController, SceneShortcutController } from './scene.controller';
import { SceneService } from './scene.service';

describe('SceneController', () => {
  let controller: SceneController;
  let shortcut: SceneShortcutController;

  beforeEach(() => {
    const service = new SceneService();
    controller = new SceneController(service);
    shortcut = new SceneShortcutController(service);
  });

  it('should render valid variant', () => {
    const svg = controller.getScene('404');
    expect(svg).toContain('404');
  });

  it('should reject invalid variant', () => {
    expect(() => controller.getScene('invalid')).toThrow(BadRequestException);
  });

  it('should reject invalid width query', () => {
    expect(() => controller.getScene('404', 'bad', '600')).toThrow(BadRequestException);
  });

  it('should render 404 shortcut', () => {
    const svg = shortcut.get404();
    expect(svg).toContain('404');
  });
});
