import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { parseBoundedCount, parsePositiveInt } from '../common/utils';
import { MockService } from './mock.service';
import { parseMockPagination } from './mock-query';

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
   * 解析 path id 参数
   */
  private parseId(id: string): number {
    try {
      return parsePositiveInt(id, 'id', 1, 100);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid id',
      );
    }
  }

  /**
   * 获取 Mock 用户列表
   */
  @Get('users')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 用户列表' })
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: '_page', required: false })
  @ApiQuery({ name: '_limit', required: false })
  listUsers(
    @Query('count') count?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const pagination = parseMockPagination(page, limit);
    if (pagination) {
      return this.mockService.listUsersPaginated(pagination.page, pagination.limit);
    }
    return this.mockService.listUsers(this.parseCount(count));
  }

  /**
   * 获取单个 Mock 用户
   */
  @Get('users/:id')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 单个用户' })
  getUser(@Param('id') id: string) {
    const userId = this.parseId(id);
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
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: '_page', required: false })
  @ApiQuery({ name: '_limit', required: false })
  listPosts(
    @Query('count') count?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const pagination = parseMockPagination(page, limit);
    if (pagination) {
      return this.mockService.listPostsPaginated(pagination.page, pagination.limit);
    }
    return this.mockService.listPosts(this.parseCount(count));
  }

  /**
   * 获取单篇 Mock 文章
   */
  @Get('posts/:id')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 单篇文章' })
  getPost(@Param('id') id: string) {
    const postId = this.parseId(id);
    const post = this.mockService.getPost(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  /**
   * 获取 Mock 商品列表
   */
  @Get('products')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 商品列表' })
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: '_page', required: false })
  @ApiQuery({ name: '_limit', required: false })
  listProducts(
    @Query('count') count?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const pagination = parseMockPagination(page, limit);
    if (pagination) {
      return this.mockService.listProductsPaginated(pagination.page, pagination.limit);
    }
    return this.mockService.listProducts(this.parseCount(count));
  }

  /**
   * 获取单个 Mock 商品
   */
  @Get('products/:id')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Mock 单个商品' })
  getProduct(@Param('id') id: string) {
    const productId = this.parseId(id);
    const product = this.mockService.getProduct(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
