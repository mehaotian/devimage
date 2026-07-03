import {
  BadRequestException,
  HttpException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { decodeRouteSeed } from '../common/text';
import { resolveClientIp } from '../common/client-ip';
import type { SvgRasterFormat } from '../common/svg-raster';
import {
  normalizePlaceholderQuery,
  parsePlaceholderRasterFormat,
  resolvePlaceholderFields,
  type PlaceholderQuery,
} from './placeholder-query';
import { PlaceholderRasterService } from './placeholder-raster.service';
import { PlaceholderService } from './placeholder.service';

/**
 * 占位图统一渲染入口（SVG / 栅格），供多个 controller 复用
 */
@Injectable()
export class PlaceholderRenderService {
  constructor(
    private readonly placeholderService: PlaceholderService,
    private readonly placeholderRasterService: PlaceholderRasterService,
  ) {}

  /**
   * 根据 path 与 query 渲染占位图
   */
  async renderFromResolved(
    w: string,
    h: string,
    query: PlaceholderQuery,
    seed?: string,
    req?: FastifyRequest,
    pathFormat?: SvgRasterFormat | null,
    pathBg?: string,
    pathFg?: string,
  ): Promise<string | StreamableFile> {
    const normalized = normalizePlaceholderQuery(query);
    const rasterFormat =
      pathFormat ?? parsePlaceholderRasterFormat(normalized.format);

    if (rasterFormat) {
      if (!req) {
        throw new BadRequestException('Raster request requires client context');
      }
      return this.renderRasterFile(
        req,
        w,
        h,
        query,
        rasterFormat,
        seed,
        pathBg,
        pathFg,
      );
    }

    if (normalized.format !== undefined && normalized.format !== '') {
      throw new BadRequestException(
        `Unsupported format: ${normalized.format}. Use svg (default), webp, or png.`,
      );
    }

    try {
      const fields = resolvePlaceholderFields(normalized, pathBg, pathFg);
      const options = this.placeholderService.resolveOptions(w, h, fields, seed);
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
    query: PlaceholderQuery,
    format: SvgRasterFormat,
    seed?: string,
    pathBg?: string,
    pathFg?: string,
  ): Promise<StreamableFile> {
    try {
      const decodedSeed = seed ? decodeRouteSeed(seed) : undefined;
      const normalized = normalizePlaceholderQuery(query);
      const fields = resolvePlaceholderFields(normalized, pathBg, pathFg);
      const options = this.placeholderService.resolveOptions(
        w,
        h,
        fields,
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
