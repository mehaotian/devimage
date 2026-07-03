import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { decodeRouteSeed } from '../common/text';
import { PlaceholderRenderService } from './placeholder-render.service';
import type { PlaceholderQuery } from './placeholder-query';

/** 栅格化路由 HTTP 限流：60 次/分钟 */
const RASTER_THROTTLE = { default: { limit: 60, ttl: 60_000 } };

@ApiTags('placeholder')
@Controller()
export class PlaceholderController {
  constructor(private readonly placeholderRender: PlaceholderRenderService) {}

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
    const result = await this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      seed,
      req,
      'webp',
    );
    if (typeof result === 'string') {
      throw new BadRequestException('Expected raster output');
    }
    return result;
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
    const result = await this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      seed,
      req,
      'png',
    );
    if (typeof result === 'string') {
      throw new BadRequestException('Expected raster output');
    }
    return result;
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
    return this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      decodeRouteSeed(seed),
      req,
    );
  }

  /**
   * 固定 seed + 路径配色
   */
  @Get('seed/:seed/:w/:h/:bg/:fg')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '固定 seed 占位图（路径配色）' })
  getSeededWithColors(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Param('bg') bg: string,
    @Param('fg') fg: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      decodeRouteSeed(seed),
      req,
      null,
      bg,
      fg,
    );
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
    const result = await this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      undefined,
      req,
      'webp',
    );
    if (typeof result === 'string') {
      throw new BadRequestException('Expected raster output');
    }
    return result;
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
    const result = await this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      undefined,
      req,
      'png',
    );
    if (typeof result === 'string') {
      throw new BadRequestException('Expected raster output');
    }
    return result;
  }

  /**
   * 显式 SVG 后缀
   */
  @Get(':w/:h.svg')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '占位图 SVG（显式后缀）' })
  getSvgExplicit(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.placeholderRender.renderFromResolved(w, h, query, undefined, req);
  }

  /**
   * 路径配色（placehold / dummyimage 风格）
   */
  @Get(':w/:h/:bg/:fg')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '占位图（路径配色）' })
  getWithPathColors(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Param('bg') bg: string,
    @Param('fg') fg: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.placeholderRender.renderFromResolved(
      w,
      h,
      query,
      undefined,
      req,
      null,
      bg,
      fg,
    );
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
  @ApiQuery({ name: 'border', required: false, description: '边框宽度 0–20；1/true 为 2px' })
  @ApiQuery({ name: 'borderColor', required: false, description: '边框色 hex' })
  @ApiQuery({ name: 'cross', required: false, description: '对角线标记 0|1' })
  @ApiQuery({ name: 'style', required: false, description: 'solid | pattern' })
  @ApiQuery({ name: 'pattern', required: false, description: 'style=pattern 时指定纹理 id' })
  getPlaceholder(
    @Req() req: FastifyRequest,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    return this.placeholderRender.renderFromResolved(w, h, query, undefined, req);
  }
}
