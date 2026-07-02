import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PlaceholderModule } from './placeholder/placeholder.module';
import { AvatarModule } from './avatar/avatar.module';
import { MockModule } from './mock/mock.module';
import { SceneModule } from './scene/scene.module';

@Module({
  imports: [HealthModule, AvatarModule, MockModule, SceneModule, PlaceholderModule],
})
export class AppModule {}
