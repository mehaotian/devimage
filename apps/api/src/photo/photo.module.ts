import { Module } from '@nestjs/common';
import { PhotoCompatController } from './photo-compat.controller';
import { PhotoCosService, PhotoRenderService } from './photo-cos.service';
import { PhotoController } from './photo.controller';
import { PhotoManifestService } from './photo-manifest.service';
import { PhotoService } from './photo.service';

@Module({
  controllers: [PhotoController, PhotoCompatController],
  providers: [PhotoManifestService, PhotoCosService, PhotoRenderService, PhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
