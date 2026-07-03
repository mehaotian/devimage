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
import { pickBarcodeQuery, type BarcodeQuery } from './barcode-query';
import { BarcodeService } from './barcode.service';
import {
  PSEUDO_CODE_CACHE_CONTROL,
  PSEUDO_CODE_RASTER_THROTTLE,
  runPseudoCodeHandler,
  runPseudoCodeHandlerAsync,
  toPseudoCodeStreamableFile,
} from './pseudo-code-http';
import { PseudoCodeRasterService } from './pseudo-code-raster.service';

const PSEUDO_BARCODE_HEADER = 'barcode';

const BARCODE_QUERY_DECORATORS = [
  ApiQuery({ name: 'fg', required: false, description: '条纹 hex' }),
  ApiQuery({ name: 'bg', required: false, description: '背景 hex' }),
  ApiQuery({
    name: 'variant',
    required: false,
    enum: ['code128', 'ean13'],
    description: '视觉变体',
  }),
] as const;

/**
 * 合并伪条码路由 OpenAPI query 声明
 */
function ApiBarcodeQueryParams() {
  return applyDecorators(
    ApiQuery(BARCODE_QUERY_DECORATORS[0]),
    ApiQuery(BARCODE_QUERY_DECORATORS[1]),
    ApiQuery(BARCODE_QUERY_DECORATORS[2]),
  );
}

@ApiTags('barcode')
@Controller('barcode')
export class BarcodeController {
  constructor(
    private readonly barcodeService: BarcodeService,
    private readonly pseudoCodeRaster: PseudoCodeRasterService,
  ) {}

  /**
   * 伪条码占位 WebP
   */
  @Get(':seed/:w/:h.webp')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_BARCODE_HEADER)
  @ApiOperation({ summary: '伪条码占位 WebP（不可扫描）' })
  @ApiBarcodeQueryParams()
  async getPseudoBarcodeWebp(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: BarcodeQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, w, h, 'webp', query);
  }

  /**
   * 伪条码占位 PNG
   */
  @Get(':seed/:w/:h.png')
  @Throttle(PSEUDO_CODE_RASTER_THROTTLE)
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_BARCODE_HEADER)
  @ApiOperation({ summary: '伪条码占位 PNG（不可扫描）' })
  @ApiBarcodeQueryParams()
  async getPseudoBarcodePng(
    @Req() req: FastifyRequest,
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: BarcodeQuery,
  ): Promise<StreamableFile> {
    return this.renderRaster(req, seed, w, h, 'png', query);
  }

  /**
   * 伪条码占位 SVG（默认）
   */
  @Get(':seed/:w/:h')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', PSEUDO_CODE_CACHE_CONTROL)
  @Header('X-DevImage-Pseudo-Code', PSEUDO_BARCODE_HEADER)
  @ApiOperation({ summary: '伪条码占位 SVG（不可扫描）' })
  @ApiBarcodeQueryParams()
  getPseudoBarcodeSvg(
    @Param('seed') seed: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: BarcodeQuery,
  ): string {
    return runPseudoCodeHandler(() =>
      this.barcodeService.renderSvg({
        seed: parseRouteSeed(seed),
        width: w,
        height: h,
        query: pickBarcodeQuery(query),
      }),
    );
  }

  /**
   * 栅格化输出封装
   */
  private async renderRaster(
    req: FastifyRequest,
    seed: string,
    w: string,
    h: string,
    format: SvgRasterFormat,
    query: BarcodeQuery,
  ): Promise<StreamableFile> {
    return runPseudoCodeHandlerAsync(async () => {
      const options = {
        seed: parseRouteSeed(seed),
        width: w,
        height: h,
        query: pickBarcodeQuery(query),
      };
      const buffer = await this.pseudoCodeRaster.renderFromSvg(
        resolveClientIp(req),
        w,
        h,
        () => this.barcodeService.renderSvg(options),
        format,
      );
      return toPseudoCodeStreamableFile(format, buffer);
    });
  }
}
