import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { PlaceholderModule } from './placeholder/placeholder.module';
import { AvatarModule } from './avatar/avatar.module';
import { MockModule } from './mock/mock.module';
import { SceneModule } from './scene/scene.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 1000 }],
    }),
    CommonModule,
    HealthModule,
    AvatarModule,
    MockModule,
    SceneModule,
    PlaceholderModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
