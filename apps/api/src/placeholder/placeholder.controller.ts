import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  BadRequestException,
  StreamableFile,
  HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { PlaceholderService } from './placeholder.service';
import { PlaceholderRasterService } from './placeholder-raster.service';
import { decodeRouteSeed } from '../common/text';
import { resolveClientIp } from '../common/client-ip';
import {
  parsePlaceholderRasterFormat,
  type PlaceholderQuery,
} from './placeholder-query';
import type { SvgRasterFormat } from '../common/svg-raster';

/** 栅格化路由 HTTP 限流：60 次/分钟 */
const RASTER_THROTTLE = { default: { limit: 60, ttl: 60_000 } };

@ApiTags('placeholder')
@Controller()
export class PlaceholderController {
  constructor(
    private readonly placeholderService: PlaceholderService,
    private readonly placeholderRasterService: PlaceholderRasterService,
  ) {}

  /**
   * 固定 seed 占位图 WebP
   */
  @Get('seed/:seed/:w/:h.webp')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '固定 seed 占位图 WebP' })
  async getSeededWebp(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: Omit<PlaceholderQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterFile(req, w, h, query, 'webp', seed);
  }

  /**
   * 固定 seed 占位图 PNG
   */
  @Get('seed/:seed/:w/:h.png')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '固定 seed 占位图 PNG' })
  async getSeededPng(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: Omit<PlaceholderQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterFile(req, w, h, query, 'png', seed);
  }

  /**
   * 固定 seed 的确定性占位图
   */
  @Get('seed/:seed/:w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '获取固定 seed 的占位图（每次相同）' })
  getSeededPlaceholder(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.renderPlaceholder(w, h, query, decodeRouteSeed(seed), req);
  }

  /**
   * 占位图 WebP
   */
  @Get(':w/:h.webp')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '占位图 WebP' })
  async getWebp(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: Omit<PlaceholderQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterFile(req, w, h, query, 'webp');
  }

  /**
   * 占位图 PNG
   */
  @Get(':w/:h.png')
  @Throttle(RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '占位图 PNG' })
  async getPng(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: Omit<PlaceholderQuery, 'format'>,
  ): Promise<StreamableFile> {
    return this.renderRasterFile(req, w, h, query, 'png');
  }

  /**
   * 随机/自定义合成占位图（默认 SVG；?format=webp|png 栅格化）
   */
  @Get(':w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '获取指定尺寸的占位图' })
  @ApiQuery({ name: 'text', required: false })
  @ApiQuery({ name: 'bg', required: false, description: '背景色 hex，不含 #' })
  @ApiQuery({ name: 'fg', required: false, description: '文字色 hex，不含 #' })
  @ApiQuery({ name: 'format', required: false, description: 'svg（默认）| webp | png' })
  getPlaceholder(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.renderPlaceholder(w, h, query, undefined, req);
  }

  /**
   * 统一占位图渲染（SVG 或 ?format= 栅格）
   */
  private async renderPlaceholder(
    w: string,
    h: string,
    query: PlaceholderQuery,
    seed?: string,
    req?: FastifyRequest,
  ): Promise<string | StreamableFile> {
    const rasterFormat = parsePlaceholderRasterFormat(query.format);

    if (rasterFormat) {
      if (!req) {
        throw new BadRequestException('Raster request requires client context');
      }
      return this.renderRasterFile(req, w, h, query, rasterFormat, seed);
    }

    if (query.format !== undefined && query.format !== '') {
      throw new BadRequestException(
        `Unsupported format: ${query.format}. Use svg (default), webp, or png.`,
      );
    }

    try {
      const options = this.placeholderService.resolveOptions(
        w,
        h,
        { text: query.text, bg: query.bg, fg: query.fg },
        seed,
      );
      return this.placeholderService.renderSvg(options);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }

  /**
   * 渲染栅格化占位图 StreamableFile
   */
  private async renderRasterFile(
    req: FastifyRequest,
    w: string,
    h: string,
    query: Omit<PlaceholderQuery, 'format'>,
    format: SvgRasterFormat,
    seed?: string,
  ): Promise<StreamableFile> {
    try {
      const decodedSeed = seed ? decodeRouteSeed(seed) : undefined;
      const options = this.placeholderService.resolveOptions(
        w,
        h,
        { text: query.text, bg: query.bg, fg: query.fg },
        decodedSeed,
      );
      const buffer = await this.placeholderRasterService.renderRaster(
        options,
        format,
        resolveClientIp(req),
      );
      return new StreamableFile(buffer, {
        type: format === 'png' ? 'image/png' : 'image/webp',
        disposition: 'inline',
      });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
