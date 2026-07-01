import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/zh_CN';

/**
 * Mock JSON 数据生成服务
 */
@Injectable()
export class MockService {
  /**
   * 生成用户列表
   */
  listUsers(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => this.buildUser(i + 1));
  }

  /**
   * 根据 ID 获取单个用户
   */
  getUser(id: number): Record<string, unknown> | null {
    if (id < 1 || id > 100) {
      return null;
    }
    return this.buildUser(id);
  }

  /**
   * 生成文章列表
   */
  listPosts(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      userId: faker.number.int({ min: 1, max: 10 }),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(2),
    }));
  }

  /**
   * 生成商品列表
   */
  listProducts(count = 10): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
      image: `https://cdn.devimage.cn/200/200?text=${encodeURIComponent('商品')}`,
    }));
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
      avatar: `https://cdn.devimage.cn/avatar/${encodeURIComponent(faker.person.firstName())}/128`,
      phone: faker.phone.number(),
      address: faker.location.city(),
    };
  }
}
