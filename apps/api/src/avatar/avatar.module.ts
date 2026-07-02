import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarStyleService } from './avatar-style.service';
import { DicebearAvatarService } from './dicebear-avatar.service';
import { NativeAvatarService } from './native-avatar.service';

@Module({
  controllers: [AvatarController],
  providers: [AvatarStyleService, DicebearAvatarService, NativeAvatarService],
})
export class AvatarModule {}
