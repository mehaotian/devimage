import { Module } from '@nestjs/common';
import { SceneController, SceneShortcutController } from './scene.controller';
import { SceneService } from './scene.service';

@Module({
  controllers: [SceneController, SceneShortcutController],
  providers: [SceneService],
})
export class SceneModule {}
