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
import { parseDimension } from '../common/utils';
import { PhotoCosService, PhotoRenderService } from './photo-cos.service';
import type { PhotoQuery } from './photo-query';
import {
  assertNoLegacyPoolId,
  hasPhotoSeed,
  parsePhotoBlur,
  parsePhotoFormat,
  parsePhotoGrayscale,
} from './photo-query';
import { PhotoManifestService } from './photo-manifest.service';
import { PhotoService } from './photo.service';

/**
 * 真实照片 API：/photo/*
 */
@ApiTags('photo')
@Controller('photo')
export class PhotoController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly renderService: PhotoRenderService,
    private readonly cosService: PhotoCosService,
    private readonly manifestService: PhotoManifestService,
  ) {}

  /**
   * 按 scene/cat/seed 返回真实图
   */
  @Get('categories')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '图库分类列表' })
  listCategories(): {
    categories: Array<Omit<ReturnType<PhotoManifestService['getCategories']>[number], 'count'>>;
  } {
    return {
      categories: this.manifestService.getCategories().map(({ count: _count, ...cat }) => cat),
    };
  }

  /**
   * scene 列表与 Mock 映射
   */
  @Get('scenes')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '业务场景列表' })
  listScenes(): {
    scenes: Array<
      Omit<
        ReturnType<PhotoManifestService['getScenesMeta']>[number],
        'photo_count' | 'mock_pool_count'
      >
    >;
  } {
    return {
      scenes: this.manifestService
        .getScenesMeta()
        .map(({ photo_count: _pc, mock_pool_count: _mpc, ...scene }) => scene),
    };
  }

  /**
   * 真实照片（scene/cat/seed）
   */
  @Get(':w/:h')
  @ApiOperation({ summary: '按场景或分类获取真实照片（seed 确定性，无 seed 随机）' })
  @ApiQuery({ name: 'scene', required: false, description: 'product|food|news|...' })
  @ApiQuery({ name: 'cat', required: false, description: '中文分类名' })
  @ApiQuery({ name: 'seed', required: false, description: '确定性选图；省略则随机' })
  @ApiQuery({ name: 'grayscale', required: false })
  @ApiQuery({ name: 'blur', required: false })
  @ApiQuery({ name: 'format', required: false })
  async getPhoto(
    @Param('w') w: string,
    @Param('h') h: string,
    @Query() query: PhotoQuery,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    return this.servePhoto(w, h, query, res);
  }

  /**
   * 渲染并响应图片（默认 API 直出，无 CDN 可本地测试）
   */
  private async servePhoto(
    w: string,
    h: string,
    query: PhotoQuery,
    res: FastifyReply,
  ): Promise<StreamableFile> {
    if (!this.photoService.isReady()) {
      throw new NotFoundException('Photo library not loaded');
    }
    assertNoLegacyPoolId(query.id);
    const width = parseDimension(w, 'width');
    const height = parseDimension(h, 'height');
    const entry = this.photoService.resolvePhoto(query);
    const format = parsePhotoFormat(query.format);
    const grayscale = parsePhotoGrayscale(query.grayscale);
    const blur = parsePhotoBlur(query.blur);
    const variant = { w: width, h: height, grayscale, blur, format };

    const { buffer, contentType } = await this.renderService.render(entry, variant);
    res.header('Content-Type', contentType);
    res.header(
      'Cache-Control',
      hasPhotoSeed(query)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=60, must-revalidate',
    );
    res.header('X-DevImage-Photo-Id', String(entry.id));
    return new StreamableFile(buffer);
  }
}
