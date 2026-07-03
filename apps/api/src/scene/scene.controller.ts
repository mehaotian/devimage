import { Controller, Get, Header, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { parseOptionalDimension } from '../common/utils';
import { SceneService, SceneVariant } from './scene.service';

const VALID_VARIANTS: SceneVariant[] = ['404', 'empty', 'network', 'search'];

@ApiTags('scene')
@Controller('scene')
export class SceneController {
  constructor(private readonly sceneService: SceneService) {}

  /**
   * 获取场景占位图（404 / empty / network / search）
   */
  @Get(':variant')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400')
  @ApiOperation({ summary: '场景占位图' })
  getScene(
    @Param('variant') variant: string,
    @Query('w') w?: string,
    @Query('h') h?: string,
  ): string {
    if (!VALID_VARIANTS.includes(variant as SceneVariant)) {
      throw new BadRequestException(
        `Invalid variant. Use: ${VALID_VARIANTS.join(', ')}`,
      );
    }

    try {
      return this.sceneService.render(
        variant as SceneVariant,
        parseOptionalDimension(w, 'width', 800),
        parseOptionalDimension(h, 'height', 600),
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}

/**
 * 快捷 404 路由（/404）
 */
@ApiTags('scene')
@Controller()
export class SceneShortcutController {
  constructor(private readonly sceneService: SceneService) {}

  /**
   * 404 快捷入口
   */
  @Get('404')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400')
  @ApiOperation({ summary: '404 占位图快捷路由' })
  get404(@Query('w') w?: string, @Query('h') h?: string): string {
    try {
      return this.sceneService.render(
        '404',
        parseOptionalDimension(w, 'width', 800),
        parseOptionalDimension(h, 'height', 600),
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
