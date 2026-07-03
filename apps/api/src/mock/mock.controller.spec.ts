import { BadRequestException } from '@nestjs/common';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';

describe('MockController', () => {
  let controller: MockController;

  beforeEach(() => {
    controller = new MockController(new MockService());
  });

  it('should list default users', () => {
    const users = controller.listUsers();
    expect(users).toHaveLength(10);
  });

  it('should reject invalid count', () => {
    expect(() => controller.listUsers('abc')).toThrow(BadRequestException);
  });

  it('should reject count above max', () => {
    expect(() => controller.listUsers('200')).toThrow(BadRequestException);
  });

  it('should reject invalid user id', () => {
    expect(() => controller.getUser('abc')).toThrow(BadRequestException);
  });

  it('should reject id above max', () => {
    expect(() => controller.getUser('999')).toThrow(BadRequestException);
  });

  it('should return user for valid id', () => {
    const user = controller.getUser('5');
    expect(user.id).toBe(5);
  });

  it('should paginate users', () => {
    const page1 = controller.listUsers(undefined, '1', '5');
    const page2 = controller.listUsers(undefined, '2', '5');
    expect(page1).toHaveLength(5);
    expect(page2).toHaveLength(5);
    expect(page1[0]?.id).toBe(1);
    expect(page2[0]?.id).toBe(6);
  });

  it('should return post for valid id', () => {
    const post = controller.getPost('3');
    expect(post.id).toBe(3);
  });

  it('should return product for valid id', () => {
    const product = controller.getProduct('7');
    expect(product.id).toBe(7);
  });
});

describe('MockService', () => {
  let service: MockService;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    service = new MockService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use DEVIMAGE_PUBLIC_URL when set', () => {
    process.env.DEVIMAGE_PUBLIC_URL = 'https://api.example.com';
    const user = service.getUser(1);
    expect(user?.avatar).toContain('https://api.example.com/avatar/devimg/');
  });

  it('should default to localhost', () => {
    delete process.env.DEVIMAGE_PUBLIC_URL;
    delete process.env.COS_CDN_DOMAIN;
    const products = service.listProducts(1);
    expect(products[0]?.image).toContain('http://localhost:3000/200/200');
  });
});
