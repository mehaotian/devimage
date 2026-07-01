import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AvatarService } from './avatar.service';

@ApiTags('avatar')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  /**
   * 根据名称生成字母/中文首字头像
   */
  @Get(':name/:size')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({ summary: '生成字母/中文首字头像' })
  getAvatar(
    @Param('name') name: string,
    @Param('size') size: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
  ): string {
    try {
      return this.avatarService.renderSvg({
        name: decodeURIComponent(name),
        size: Number.parseInt(size, 10),
        bg,
        fg,
      });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid parameters',
      );
    }
  }
}
