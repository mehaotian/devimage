import { Module } from '@nestjs/common';
import { PlaceholderController } from './placeholder.controller';
import { PlaceholderService } from './placeholder.service';
import { PlaceholderRasterService } from './placeholder-raster.service';

@Module({
  controllers: [PlaceholderController],
  providers: [PlaceholderService, PlaceholderRasterService],
  exports: [PlaceholderService],
})
export class PlaceholderModule {}
