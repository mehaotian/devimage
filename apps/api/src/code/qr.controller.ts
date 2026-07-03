import {
  applyDecorators,
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { parseRouteSeed } from '../common/text';
import { resolveClientIp } from '../common/client-ip';
import type { SvgRasterFormat } from '../common/svg-raster';
import {
  PSEUDO_CODE_CACHE_CONTROL,
  PSEUDO_CODE_RASTER_THROTTLE,
  runPseudoCodeHandler,
  runPseudoCodeHandlerAsync,
  toPseudoCodeStreamableFile,
} from './pseudo-code-http';
import { PseudoCodeRasterService } from './pseudo-code-raster.service';
import { pickQrQuery, type QrQuery } from './qr-query';
import { QrService } from './qr.service';

const PSEUDO_QR_HEADER = 'qr';

const QR_QUERY_DECORATORS = [
  ApiQuery({ name: 'fg', required: false, description: '模块深色 hex' }),
  ApiQuery({ name: 'bg', required: false, description: '背景浅色 hex' }),
  ApiQuery({ name: 'accent', required: false, description: '强调模块 hex' }),
  ApiQuery({
    name: 'variant',
    required: false,
    enum: ['matrix', 'minimal', 'dots'],
    description: '视觉变体',
  }),
  ApiQuery({ name: 'radius', required: false, description: '模块圆角 0–50' }),
] as const;

/**
 * 合并伪 QR 路由 OpenAPI query 声明
 */
function ApiQrQueryParams() {
  return applyDecorators(
    ApiQuery(QR_QUERY_DECORATORS[0]),
    ApiQuery(QR_QUERY_DECORATORS[1]),
    ApiQuery(QR_QUERY_DECORATORS[2]),
    ApiQuery(QR_QUERY_DECORATORS[3]),
    ApiQuery(QR_QUERY_DECORATORS[4]),
  );
}

@ApiTags('qr')
@Controller('qr')
export class QrController {
  constructor(
    private readonly qrService: QrService,
    private readonly pseudoCodeRaster: PseudoCodeRasterService,
  ) {}

  /**
   * 矩形伪 QR 占位 WebP
   */
  @Get(':seed/:w/:h.webp')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '矩形伪 QR 占位 WebP（不可扫描）' })
  @ApiQrQueryParams()
  async getPseudoQrRectWebp(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: QrQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, w, h, 'webp', query);
  }

  /**
   * 矩形伪 QR 占位 PNG
   */
  @Get(':seed/:w/:h.png')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '矩形伪 QR 占位 PNG（不可扫描）' })
  @ApiQrQueryParams()
  async getPseudoQrRectPng(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: QrQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, w, h, 'png', query);
  }

  /**
   * 矩形伪 QR 占位 SVG
   */
  @Get(':seed/:w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '矩形伪 QR 占位 SVG（不可扫描）' })
  @ApiQrQueryParams()
  getPseudoQrRectSvg(
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: QrQuery,
  ): string {
    return this.renderSvg(seed, w, h, query);
  }

  /**
   * 正方形伪 QR 占位 WebP
   */
  @Get(':seed/:size.webp')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '正方形伪 QR 占位 WebP（不可扫描）' })
  @ApiQrQueryParams()
  async getPseudoQrSquareWebp(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: QrQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, size, size, 'webp', query);
  }

  /**
   * 正方形伪 QR 占位 PNG
   */
  @Get(':seed/:size.png')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '正方形伪 QR 占位 PNG（不可扫描）' })
  @ApiQrQueryParams()
  async getPseudoQrSquarePng(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: QrQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, size, size, 'png', query);
  }

  /**
   * 正方形伪 QR 占位 SVG（默认）
   */
  @Get(':seed/:size')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_QR_HEADER)
  @ApiOperation({ summary: '正方形伪 QR 占位 SVG（不可扫描）' })
  @ApiQrQueryParams()
  getPseudoQrSquareSvg(
    @Param('seed') seed: string,
    @Param('size') size: string,
    @Query() query: QrQuery,
  ): string {
    return this.renderSvg(seed, size, size, query);
  }

  /**
   * 渲染 SVG 并校验参数
   */
  private renderSvg(seed: string, width: string, height: string, query: QrQuery): string {
    return runPseudoCodeHandler(() =>
      this.qrService.renderSvg({
        seed: parseRouteSeed(seed),
        width,
        height,
        query: pickQrQuery(query),
      }),
    );
  }

  /**
   * 栅格化输出封装
   */
  private async renderRaster(
    req: FastifyRequest,
    seed: string,
    width: string,
    height: string,
    format: SvgRasterFormat,
    query: QrQuery,
  ): Promise<StreamableFile> {
    return runPseudoCodeHandlerAsync(async () => {
      const options = {
        seed: parseRouteSeed(seed),
        width,
        height,
        query: pickQrQuery(query),
      };
      const buffer = await this.pseudoCodeRaster.renderFromSvg(
        resolveClientIp(req),
        width,
        height,
        () => this.qrService.renderSvg(options),
        format,
      );
      return toPseudoCodeStreamableFile(format, buffer);
    });
  }
}
