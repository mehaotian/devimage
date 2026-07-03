import { Global, Module } from '@nestjs/common';
import { RasterRateLimitService } from './raster-rate-limit.service';

@Global()
@Module({
  providers: [RasterRateLimitService],
  exports: [RasterRateLimitService],
})
export class CommonModule {}
