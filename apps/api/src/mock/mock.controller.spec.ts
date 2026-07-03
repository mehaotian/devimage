import { BadRequestException } from '@nestjs/common';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';
import { PhotoService } from '../photo/photo.service';

/** 测试用 PhotoService 桩 */
function createPhotoServiceStub(ready = false): PhotoService {
  return {
    isReady: () => ready,
    buildPhotoUrl: (base: string, w: number, h: number, opts: { scene: string; seed: string }) =>
      `${base}/photo/${w}/${h}?scene=${opts.scene}&seed=${encodeURIComponent(opts.seed)}`,
    getMockScene: (resource: string) => (resource === 'products' ? 'product' : 'news'),
  } as unknown as PhotoService;
}

describe('MockController', () => {
  let controller: MockController;

  beforeEach(() => {
    controller = new MockController(new MockService(createPhotoServiceStub()));
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
    service = new MockService(createPhotoServiceStub(false));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use DEVIMAGE_PUBLIC_URL when set', () => {
    process.env.DEVIMAGE_PUBLIC_URL = 'https://api.example.com';
    const user = service.getUser(1);
    expect(user?.avatar).toContain('https://api.example.com/avatar/devimg/');
  });

  it('should fallback to placeholder when manifest not ready', () => {
    delete process.env.DEVIMAGE_PUBLIC_URL;
    delete process.env.COS_CDN_DOMAIN;
    const products = service.listProducts(1);
    expect(products[0]?.image).toContain('http://localhost:3000/400/400');
  });

  it('should use photo url when manifest ready', () => {
    const ready = new MockService(createPhotoServiceStub(true));
    const product = ready.listProducts(1)[0];
    expect(product?.image).toContain('/photo/400/400?scene=product&seed=product-1');
  });
});
