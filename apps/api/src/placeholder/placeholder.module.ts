import { Module } from '@nestjs/common';
import { PlaceholderController } from './placeholder.controller';
import { PlaceholderService } from './placeholder.service';

@Module({
  controllers: [PlaceholderController],
  providers: [PlaceholderService],
  exports: [PlaceholderService],
})
export class PlaceholderModule {}
