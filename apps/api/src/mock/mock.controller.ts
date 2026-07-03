import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { parseBoundedCount, parsePositiveInt } from '../common/utils';
import { MockService } from './mock.service';

@ApiTags('mock')
@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  /**
   * 解析 count query，非法返回 400
   */
  private parseCount(count?: string): number {
    try {
      return parseBoundedCount(count, 10, 100);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid count',
      );
    }
  }

  /**
   * 获取 Mock 用户列表
   */
  @Get('users')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 用户列表' })
  listUsers(@Query('count') count?: string) {
    return this.mockService.listUsers(this.parseCount(count));
  }

  /**
   * 获取单个 Mock 用户
   */
  @Get('users/:id')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 单个用户' })
  getUser(@Param('id') id: string) {
    let userId: number;
    try {
      userId = parsePositiveInt(id, 'id', 1, 100);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid id',
      );
    }

    const user = this.mockService.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * 获取 Mock 文章列表
   */
  @Get('posts')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 文章列表' })
  listPosts(@Query('count') count?: string) {
    return this.mockService.listPosts(this.parseCount(count));
  }

  /**
   * 获取 Mock 商品列表
   */
  @Get('products')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 商品列表' })
  listProducts(@Query('count') count?: string) {
    return this.mockService.listProducts(this.parseCount(count));
  }
}
