import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { PlaceholderModule } from './placeholder/placeholder.module';
import { AvatarModule } from './avatar/avatar.module';
import { MockModule } from './mock/mock.module';
import { SceneModule } from './scene/scene.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
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
