import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { parsePositiveInt } from '../common/utils';
import { PhotoCosService, PhotoRenderService } from './photo-cos.service';
import type { PhotoQuery } from './photo-query';
import {
  parsePhotoBlur,
  parsePhotoFormat,
  parsePhotoGrayscale,
} from './photo-query';
import { PhotoService } from './photo.service';

/**
 * picsum 兼容：/id/:id/:w/:h 与 /v2/list
 */
@ApiTags('photo')
@Controller()
export class PhotoCompatController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly renderService: PhotoRenderService,
    private readonly cosService: PhotoCosService,
  ) {}

  /**
   * picsum 固定 ID 照片
   */
  @Get('id/:id/:w/:h')
  @ApiOperation({ summary: 'picsum 兼容：固定 ID 真实照片' })
  async getById(
    @Param('id') id: string,
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PhotoQuery,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    if (!this.photoService.isReady()) {
      throw new NotFoundException('Photo library not loaded');
    }
    const photoId = parsePositiveInt(id, 'id', 1, 100_000);
    const entry = this.photoService.resolvePhoto(query, photoId);
    const width = parsePositiveInt(w, 'width', 10, 4000);
    const height = parsePositiveInt(h, 'height', 10, 4000);
    const format = parsePhotoFormat(query.format);
    const grayscale = parsePhotoGrayscale(query.grayscale);
    const blur = parsePhotoBlur(query.blur);
    const variant = { w: width, h: height, grayscale, blur, format };
    const { buffer, contentType } = await this.renderService.render(entry, variant);
    res.header('Content-Type', contentType);
    res.header('Cache-Control', 'public, max-age=31536000, immutable');
    res.header('X-DevImage-Photo-Id', String(entry.id));
    return new StreamableFile(buffer);
  }

  /**
   * picsum 照片元信息
   */
  @Get('id/:id/info')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'picsum 兼容：照片信息' })
  getInfo(@Param('id') id: string): Record<string, unknown> {
    const photoId = parsePositiveInt(id, 'id', 1, 100_000);
    return this.photoService.getPhotoInfo(photoId);
  }

  /**
   * picsum 列表
   */
  @Get('v2/list')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'picsum 兼容：照片列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cat', required: false })
  list(
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('cat') cat?: string,
  ): ReturnType<PhotoService['listPhotos']> {
    const page = pageRaw ? parsePositiveInt(pageRaw, 'page', 1, 10_000) : 1;
    const limit = limitRaw ? parsePositiveInt(limitRaw, 'limit', 1, 100) : 30;
    return this.photoService.listPhotos(page, limit, cat?.trim() || undefined);
  }
}
