import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MockService } from './mock.service';

@ApiTags('mock')
@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  /**
   * 获取 Mock 用户列表
   */
  @Get('users')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 用户列表' })
  listUsers(@Query('count') count?: string) {
    const n = count ? Math.min(Number.parseInt(count, 10), 100) : 10;
    return this.mockService.listUsers(n);
  }

  /**
   * 获取单个 Mock 用户
   */
  @Get('users/:id')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 单个用户' })
  getUser(@Param('id') id: string) {
    const user = this.mockService.getUser(Number.parseInt(id, 10));
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
    const n = count ? Math.min(Number.parseInt(count, 10), 100) : 10;
    return this.mockService.listPosts(n);
  }

  /**
   * 获取 Mock 商品列表
   */
  @Get('products')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 商品列表' })
  listProducts(@Query('count') count?: string) {
    const n = count ? Math.min(Number.parseInt(count, 10), 100) : 10;
    return this.mockService.listProducts(n);
  }
}
