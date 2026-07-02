import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarRasterService } from './avatar-raster.service';
import { AvatarStyleService } from './avatar-style.service';
import { DicebearAvatarService } from './dicebear-avatar.service';
import { JdenticonAvatarService } from './jdenticon-avatar.service';
import { MinidenticonsAvatarService } from './minidenticons-avatar.service';
import { NativeAvatarService } from './native-avatar.service';

@Module({
  controllers: [AvatarController],
  providers: [
    AvatarRasterService,
    AvatarStyleService,
    DicebearAvatarService,
    JdenticonAvatarService,
    MinidenticonsAvatarService,
    NativeAvatarService,
  ],
})
export class AvatarModule {}
