import { Module } from '@nestjs/common';
import { PlaceholderAliasController } from './placeholder-alias.controller';
import { PlaceholderController } from './placeholder.controller';
import { PlaceholderRenderService } from './placeholder-render.service';
import { PlaceholderService } from './placeholder.service';
import { PlaceholderRasterService } from './placeholder-raster.service';

@Module({
  controllers: [PlaceholderAliasController, PlaceholderController],
  providers: [PlaceholderService, PlaceholderRasterService, PlaceholderRenderService],
  exports: [PlaceholderService],
})
export class PlaceholderModule {}
