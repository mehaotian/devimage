import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import type { StreamableFile } from '@nestjs/common';
import { isDimSpecSegment, parseDimSpec } from './placeholder-dim';
import { PlaceholderRenderService } from './placeholder-render.service';
import type { PlaceholderQuery } from './placeholder-query';

/**
 * placehold 风格 `800x600` 别名路由（须在通配 `/:w/:h` 之前注册）
 */
@ApiTags('placeholder')
@Controller()
export class PlaceholderAliasController {
  constructor(private readonly placeholderRender: PlaceholderRenderService) {}

  /**
   * placehold 风格路径配色：`/800x600/eee/fff`
   */
  @Get(':dims/:bg/:fg')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'placehold 风格尺寸别名（含路径配色）' })
  getDimSpecWithColors(
    @Req() req: FastifyRequest,
    @Param('dims') dims: string,
    @Param('bg') bg: string,
    @Param('fg') fg: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    if (!isDimSpecSegment(dims)) {
      throw new NotFoundException();
    }

    const { width, height, format } = parseDimSpec(dims);
    return this.placeholderRender.renderFromResolved(
      String(width),
      String(height),
      query,
      undefined,
      req,
      format,
      bg,
      fg,
    );
  }

  /**
   * placehold 风格尺寸：`/800x600`、 `/800x600.svg`、 `/800x600.webp`
   */
  @Get(':dims')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'placehold 风格尺寸别名' })
  getDimSpec(
    @Req() req: FastifyRequest,
    @Param('dims') dims: string,
    @Query() query: PlaceholderQuery,
  ): Promise<string | StreamableFile> {
    if (!isDimSpecSegment(dims)) {
      throw new NotFoundException();
    }

    const { width, height, format } = parseDimSpec(dims);
    return this.placeholderRender.renderFromResolved(
      String(width),
      String(height),
      query,
      undefined,
      req,
      format,
    );
  }
}
