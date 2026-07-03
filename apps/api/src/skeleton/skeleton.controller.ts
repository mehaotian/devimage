import { Controller, Get, Header, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkeletonService } from './skeleton.service';
import {
  parseSkeletonAnimate,
  parseSkeletonCols,
  parseSkeletonTheme,
  parseSkeletonType,
} from './skeleton-query';

@ApiTags('skeleton')
@Controller('skeleton')
export class SkeletonController {
  constructor(private readonly skeletonService: SkeletonService) {}

  /**
   * 获取骨架屏占位 SVG
   */
  @Get(':w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '骨架屏占位图（page/card/row/grid）' })
  @ApiQuery({ name: 'type', required: false, description: 'page | card | row | grid' })
  @ApiQuery({ name: 'theme', required: false, description: 'light | dark' })
  @ApiQuery({ name: 'cols', required: false, description: 'grid 列数 1–6' })
  @ApiQuery({ name: 'animate', required: false, description: '0 | 1 静态 shimmer' })
  getSkeleton(
    @Param('w') w: string,
    @Param('h') h: string,
    @Query('type') type?: string,
    @Query('theme') theme?: string,
    @Query('cols') cols?: string,
    @Query('animate') animate?: string,
  ): string {
    try {
      const options = this.skeletonService.resolveOptions(
        w,
        h,
        parseSkeletonType(type),
        parseSkeletonTheme(theme),
        parseSkeletonCols(cols),
        parseSkeletonAnimate(animate),
      );
      return this.skeletonService.renderSvg(options);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
