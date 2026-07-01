import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlaceholderService } from './placeholder.service';

@ApiTags('placeholder')
@Controller()
export class PlaceholderController {
  constructor(private readonly placeholderService: PlaceholderService) {}

  /**
   * 随机/自定义合成占位图
   */
  @Get(':w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '获取指定尺寸的占位图' })
  @ApiQuery({ name: 'text', required: false })
  @ApiQuery({ name: 'bg', required: false, description: '背景色 hex，不含 #' })
  @ApiQuery({ name: 'fg', required: false, description: '文字色 hex，不含 #' })
  getPlaceholder(
    @Param('w') w: string,
    @Param('h') h: string,
    @Query('text') text?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
  ): string {
    try {
      const options = this.placeholderService.resolveOptions(w, h, {
        text,
        bg,
        fg,
      });
      return this.placeholderService.renderSvg(options);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }

  /**
   * 固定 seed 的确定性占位图
   */
  @Get('seed/:seed/:w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '获取固定 seed 的占位图（每次相同）' })
  getSeededPlaceholder(
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query('text') text?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
  ): string {
    try {
      const options = this.placeholderService.resolveOptions(
        w,
        h,
        { text, bg, fg },
        seed,
      );
      return this.placeholderService.renderSvg(options);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
