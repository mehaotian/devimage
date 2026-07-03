import { Module } from '@nestjs/common';
import { SkeletonController } from './skeleton.controller';
import { SkeletonService } from './skeleton.service';

@Module({
  controllers: [SkeletonController],
  providers: [SkeletonService],
})
export class SkeletonModule {}
