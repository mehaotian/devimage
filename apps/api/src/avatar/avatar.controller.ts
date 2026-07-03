import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  BadRequestException,
  NotFoundException,
  StreamableFile,
  HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import {
  AvatarStyleService,
  type StyledAvatarRenderOptions,
} from './avatar-style.service';
import {
  AvatarRasterService,
  type AvatarRasterFormat,
} from './avatar-raster.service';
import {
  pickStyledAvatarQuery,
  pickStyledAvatarRasterQuery,
  type StyledAvatarQuery,
} from './styled-avatar-query';
import { decodeRouteSeed } from '../common/text';
import { resolveClientIp } from '../common/client-ip';

/** 栅格化路由限流：每 IP 每分钟 60 次 */
const RASTER_THROTTLE = { default: { limit: 60, ttl: 60_000 } };

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
  @SkipThrottle()
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
  @SkipThrottle()
  @Header('Cache-Control', 'public, max-age=60, must-revalidate')
  @ApiOperation({ summary: '列出 devimg 纹理 pattern 目录' })
  listPatterns() {
    return this.avatarStyleService.listPatterns();
  }

  /**
   * 多风格 seed 头像 WebP（栅格化，兼容小程序等场景）
   */
  @Get(':style/:seed/:size.webp')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 WebP 头像' })
  async getStyledAvatarWebp(
    @Req() req: FastifyRequest,
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: Omit<StyledAvatarQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterAvatar(
      req,
      style,
      seed,
      size,
      'webp',
      pickStyledAvatarRasterQuery(query),
    );
  }

  /**
   * 多风格 seed 头像 PNG（栅格化，最大兼容性）
   */
  @Get(':style/:seed/:size.png')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 PNG 头像' })
  async getStyledAvatarPng(
    @Req() req: FastifyRequest,
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: Omit<StyledAvatarQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterAvatar(
      req,
      style,
      seed,
      size,
      'png',
      pickStyledAvatarRasterQuery(query),
    );
  }

  /**
   * 多风格 seed 头像（默认 SVG；?format=webp|png 栅格化）
   */
  @Get(':style/:seed/:size')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '按 style + seed 生成 SVG 头像（可选 format 栅格化）' })
  async getStyledAvatar(
    @Req() req: FastifyRequest,
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: StyledAvatarQuery,
  ): Promise<StreamableFile> {
    const picked = pickStyledAvatarQuery(query);
    const rasterFormat = this.parseRasterFormat(picked.format);

    if (rasterFormat) {
      return this.renderRasterAvatar(req, style, seed, size, rasterFormat, picked);
    }

    if (picked.format !== undefined && picked.format !== '') {
      throw new BadRequestException(
        `Unsupported format: ${picked.format}. Use svg (default), webp, or png.`,
      );
    }

    const svg = this.renderSvgAvatar(style, seed, size, picked);
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
    raster = false,
  ): StyledAvatarRenderOptions {
    if (!this.avatarStyleService.isKnownStyle(style)) {
      throw new NotFoundException(`Unknown avatar style: ${style}`);
    }

    let decodedSeed: string;
    try {
      decodedSeed = decodeRouteSeed(seed);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid seed',
      );
    }

    return {
      style,
      seed: decodedSeed,
      size: Number.parseInt(size, 10),
      variant: query.variant,
      text: query.text,
      shape: query.shape,
      bg: query.bg,
      fg: query.fg,
      pattern: query.pattern,
      raster,
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
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }

  /**
   * 渲染栅格化头像（PNG / WebP）
   */
  private async renderRasterAvatar(
    req: FastifyRequest,
    style: string,
    seed: string,
    size: string,
    format: AvatarRasterFormat,
    query: StyledAvatarQuery,
  ): Promise<StreamableFile> {
    try {
      const buffer = await this.avatarRasterService.renderRaster(
        this.buildRenderOptions(style, seed, size, query, true),
        format,
        resolveClientIp(req),
      );
      return new StreamableFile(buffer, {
        type: format === 'png' ? 'image/png' : 'image/webp',
        disposition: 'inline',
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
