import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
    return this.sceneService.render(
      variant as SceneVariant,
      w ? Number.parseInt(w, 10) : 800,
      h ? Number.parseInt(h, 10) : 600,
    );
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
    return this.sceneService.render(
      '404',
      w ? Number.parseInt(w, 10) : 800,
      h ? Number.parseInt(h, 10) : 600,
    );
  }
}
