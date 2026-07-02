import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AvatarStyleService,
  type StyledAvatarRenderOptions,
} from './avatar-style.service';
import {
  AvatarRasterService,
  type AvatarRasterFormat,
} from './avatar-raster.service';

interface StyledAvatarQuery {
  variant?: string;
  text?: string;
  shape?: string;
  bg?: string;
  fg?: string;
  pattern?: string;
  format?: string;
}

@ApiTags('avatar')
@Controller('avatar')
export class AvatarController {
  constructor(
    private readonly avatarStyleService: AvatarStyleService,
    private readonly avatarRasterService: AvatarRasterService,
  ) {}

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
  @Header('Cache-Control', 'public, max-age=60, must-revalidate')
  @ApiOperation({ summary: '列出 devimg 纹理 pattern 目录' })
  listPatterns() {
    return this.avatarStyleService.listPatterns();
  }

  /**
   * 多风格 seed 头像 WebP（栅格化，兼容小程序等场景）
   */
  @Get(':style/:seed/:size.webp')
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 WebP 头像' })
  async getStyledAvatarWebp(
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query('variant') variant?: string,
    @Query('text') text?: string,
    @Query('shape') shape?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
    @Query('pattern') pattern?: string,
  ): Promise<StreamableFile> {
    return this.renderRasterAvatar(
      style,
      seed,
      size,
      'webp',
      { variant, text, shape, bg, fg, pattern },
    );
  }

  /**
   * 多风格 seed 头像 PNG（栅格化，最大兼容性）
   */
  @Get(':style/:seed/:size.png')
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 PNG 头像' })
  async getStyledAvatarPng(
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query('variant') variant?: string,
    @Query('text') text?: string,
    @Query('shape') shape?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
    @Query('pattern') pattern?: string,
  ): Promise<StreamableFile> {
    return this.renderRasterAvatar(
      style,
      seed,
      size,
      'png',
      { variant, text, shape, bg, fg, pattern },
    );
  }

  /**
   * 多风格 seed 头像（默认 SVG；?format=webp|png 栅格化）
   */
  @Get(':style/:seed/:size')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 SVG 头像（可选 format 栅格化）' })
  async getStyledAvatar(
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query('variant') variant?: string,
    @Query('text') text?: string,
    @Query('shape') shape?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
    @Query('pattern') pattern?: string,
    @Query('format') format?: string,
  ): Promise<StreamableFile> {
    const query: StyledAvatarQuery = {
      variant,
      text,
      shape,
      bg,
      fg,
      pattern,
      format,
    };
    const rasterFormat = this.parseRasterFormat(format);

    if (rasterFormat) {
      return this.renderRasterAvatar(style, seed, size, rasterFormat, query);
    }

    if (format !== undefined && format !== '') {
      throw new BadRequestException(
        `Unsupported format: ${format}. Use svg (default), webp, or png.`,
      );
    }

    const svg = this.renderSvgAvatar(style, seed, size, query);
    return new StreamableFile(Buffer.from(svg, 'utf-8'), {
      type: 'image/svg+xml; charset=utf-8',
      disposition: 'inline',
    });
  }

  /**
   * 解析 ?format= 栅格格式（svg 走默认分支）
   */
  private parseRasterFormat(format?: string): AvatarRasterFormat | null {
    if (!format) {
      return null;
    }

    const normalized = format.toLowerCase();
    if (normalized === 'svg') {
      return null;
    }
    if (normalized === 'webp' || normalized === 'png') {
      return normalized;
    }

    return null;
  }

  /**
   * 组装 render 选项并校验 style
   */
  private buildRenderOptions(
    style: string,
    seed: string,
    size: string,
    query: StyledAvatarQuery,
  ): StyledAvatarRenderOptions {
    if (!this.avatarStyleService.isKnownStyle(style)) {
      throw new NotFoundException(`Unknown avatar style: ${style}`);
    }

    return {
      style,
      seed: decodeURIComponent(seed),
      size: Number.parseInt(size, 10),
      variant: query.variant,
      text: query.text,
      shape: query.shape,
      bg: query.bg,
      fg: query.fg,
      pattern: query.pattern,
    };
  }

  /**
   * 渲染 SVG 头像字符串
   */
  private renderSvgAvatar(
    style: string,
    seed: string,
    size: string,
    query: StyledAvatarQuery,
  ): string {
    try {
      return this.avatarStyleService.renderSvg(
        this.buildRenderOptions(style, seed, size, query),
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }

  /**
   * 渲染栅格化头像（PNG / WebP）
   */
  private async renderRasterAvatar(
    style: string,
    seed: string,
    size: string,
    format: AvatarRasterFormat,
    query: StyledAvatarQuery,
  ): Promise<StreamableFile> {
    try {
      const buffer = await this.avatarRasterService.renderRaster(
        this.buildRenderOptions(style, seed, size, query),
        format,
      );
      return new StreamableFile(buffer, {
        type: format === 'png' ? 'image/png' : 'image/webp',
        disposition: 'inline',
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
