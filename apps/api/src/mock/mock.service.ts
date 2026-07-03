import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/zh_CN';
import { MOCK_POOL_MAX, sliceMockPool } from './mock-query';

/**
 * Mock JSON 数据生成服务
 */
@Injectable()
export class MockService {
  /**
   * 对外公开的基础 URL（本地 / CDN）
   */
  getPublicBaseUrl(): string {
    const fromEnv = process.env.DEVIMAGE_PUBLIC_URL ?? process.env.COS_CDN_DOMAIN;
    const base = (fromEnv ?? 'http://localhost:3000').replace(/\/$/, '');
    return base;
  }

  /**
   * 生成用户列表
   */
  listUsers(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => this.buildUser(i + 1));
  }

  /**
   * 分页用户列表（池大小 100）
   */
  listUsersPaginated(page: number, limit: number): Array<Record<string, unknown>> {
    return sliceMockPool((id) => this.buildUser(id), page, limit);
  }

  /**
   * 根据 ID 获取单个用户
   */
  getUser(id: number): Record<string, unknown> | null {
    if (id < 1 || id > MOCK_POOL_MAX) {
      return null;
    }
    return this.buildUser(id);
  }

  /**
   * 生成文章列表
   */
  listPosts(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => this.buildPost(i + 1));
  }

  /**
   * 分页文章列表
   */
  listPostsPaginated(page: number, limit: number): Array<Record<string, unknown>> {
    return sliceMockPool((id) => this.buildPost(id), page, limit);
  }

  /**
   * 根据 ID 获取单篇文章
   */
  getPost(id: number): Record<string, unknown> | null {
    if (id < 1 || id > MOCK_POOL_MAX) {
      return null;
    }
    return this.buildPost(id);
  }

  /**
   * 生成商品列表
   */
  listProducts(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => this.buildProduct(i + 1));
  }

  /**
   * 分页商品列表
   */
  listProductsPaginated(page: number, limit: number): Array<Record<string, unknown>> {
    return sliceMockPool((id) => this.buildProduct(id), page, limit);
  }

  /**
   * 根据 ID 获取单个商品
   */
  getProduct(id: number): Record<string, unknown> | null {
    if (id < 1 || id > MOCK_POOL_MAX) {
      return null;
    }
    return this.buildProduct(id);
  }

  /**
   * 构建单个用户对象
   */
  private buildUser(id: number): Record<string, unknown> {
    faker.seed(id);
    return {
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: `${this.getPublicBaseUrl()}/avatar/devimg/${encodeURIComponent(faker.person.firstName())}/128`,
      phone: faker.phone.number(),
      address: faker.location.city(),
    };
  }

  /**
   * 构建单篇文章对象
   */
  private buildPost(id: number): Record<string, unknown> {
    faker.seed(id + 10_000);
    return {
      id,
      userId: ((id - 1) % 10) + 1,
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(2),
    };
  }

  /**
   * 构建单个商品对象
   */
  private buildProduct(id: number): Record<string, unknown> {
    faker.seed(id + 20_000);
    return {
      id,
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
      image: `${this.getPublicBaseUrl()}/200/200?text=${encodeURIComponent('商品')}`,
    };
  }
}
