import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AvatarStyleService } from './avatar-style.service';

@ApiTags('avatar')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarStyleService: AvatarStyleService) {}

  /**
   * 列出可用头像风格（native + partner）
   */
  @Get('styles')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '列出可用头像风格' })
  listStyles() {
    const styles = this.avatarStyleService.listStyles();
    const nativeCount = styles.filter((item) => item.engine === 'native').length;
    const partnerCount = styles.filter((item) => item.engine === 'partner').length;
    return {
      count: styles.length,
      nativeCount,
      partnerCount,
      styles,
    };
  }

  /**
   * 列出 devimg 纹理 pattern 目录
   */
  @Get('patterns')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '列出 devimg 纹理 pattern 目录' })
  listPatterns() {
    return this.avatarStyleService.listPatterns();
  }

  /**
   * 多风格 seed 头像（native / partner SVG）
   */
  @Get(':style/:seed/:size')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 SVG 头像' })
  getStyledAvatar(
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query('variant') variant?: string,
    @Query('text') text?: string,
    @Query('shape') shape?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
    @Query('pattern') pattern?: string,
  ): string {
    if (!this.avatarStyleService.isKnownStyle(style)) {
      throw new NotFoundException(`Unknown avatar style: ${style}`);
    }

    try {
      return this.avatarStyleService.renderSvg({
        style,
        seed: decodeURIComponent(seed),
        size: Number.parseInt(size, 10),
        variant,
        text,
        shape,
        bg,
        fg,
        pattern,
      });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
