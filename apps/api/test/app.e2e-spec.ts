import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { CODE_STYLES_CATALOG } from '../src/code/code-styles.catalog';
import { PSEUDO_CODE_GOLDEN_ROUTES } from '../src/common/pseudo-code-verify';
import { PSEUDO_CODE_GOLDEN_HASHES, sha256Svg } from '../src/common/pseudo-code-golden';

describe('DevImage API (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should return ok with dependency checks', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; checks: { name: string; ok: boolean }[] };
    expect(body.status).toBe('ok');
    expect(body.checks.length).toBeGreaterThan(0);
    expect(body.checks.some((item) => item.name === 'pseudo-code' && item.ok)).toBe(true);
  });

  it('GET /800/600 should return svg', async () => {
    const response = await app.inject({ method: 'GET', url: '/800/600' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.body).toContain('<svg');
  });

  it('GET /800x600 should return svg alias', async () => {
    const response = await app.inject({ method: 'GET', url: '/800x600' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.body).toContain('width="800"');
  });

  it('GET /800/600/eee/fff should use path colors', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/800/600/eee/fff?text=Banner',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('fill="#eeeeee"');
    expect(response.body).toContain('fill="#ffffff"');
  });

  it('GET /800/600.svg should return svg', async () => {
    const response = await app.inject({ method: 'GET', url: '/800/600.svg' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
  });

  it('GET /800/600?border=2&cross=1 should render border and cross', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/800/600?border=2&cross=1',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('stroke-width="2"');
    expect(response.body).toContain('<line');
  });

  it('GET /skeleton/375/812?type=page should return skeleton svg', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/skeleton/375/812?type=page',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.body).toContain('<svg');
  });

  it('GET /800/600.webp should return webp', async () => {
    const response = await app.inject({ method: 'GET', url: '/400/300.webp' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
    expect(response.rawPayload.length).toBeGreaterThan(100);
  });

  it('GET /seed/demo/800/600 should be deterministic', async () => {
    const a = await app.inject({ method: 'GET', url: '/seed/demo/800/600' });
    const b = await app.inject({ method: 'GET', url: '/seed/demo/800/600' });
    expect(a.body).toBe(b.body);
  });

  it('GET /seed/%E5%BC%A0%E4%B8%89/200/200 should decode seed', async () => {
    const encoded = await app.inject({
      method: 'GET',
      url: '/seed/%E5%BC%A0%E4%B8%89/200/200',
    });
    const plain = await app.inject({
      method: 'GET',
      url: '/seed/张三/200/200',
    });
    expect(encoded.body).toBe(plain.body);
  });

  it('GET /avatar/devimg/Luna/128 should return svg', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/avatar/devimg/Luna/128',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
  });

  it('GET /avatar/devimg/Luna/128.webp should return webp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/avatar/devimg/Luna/128.webp',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
  });

  it('GET /avatar/devimg/Luna/128?format=webp should return webp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/avatar/devimg/Luna/128?format=webp',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
  });

  it('GET /scene/404 should return svg', async () => {
    const response = await app.inject({ method: 'GET', url: '/scene/404' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('404');
  });

  it('GET /scene/empty?theme=dark&title=Hi should apply query', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/scene/empty?theme=dark&title=Hi&seed=demo',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Hi');
    expect(response.body).toContain('fill="#');
  });

  it('GET /mock/users?_page=2&_limit=5 should paginate', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/mock/users?_page=2&_limit=5',
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { id: number }[];
    expect(body).toHaveLength(5);
    expect(body[0]?.id).toBe(6);
  });

  it('GET /mock/posts/1 should return single post', async () => {
    const response = await app.inject({ method: 'GET', url: '/mock/posts/1' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { id: number };
    expect(body.id).toBe(1);
  });

  it('GET /mock/products/2 should return single product', async () => {
    const response = await app.inject({ method: 'GET', url: '/mock/products/2' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { id: number };
    expect(body.id).toBe(2);
  });

  it('GET /scene/404?w=bad should return 400', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/scene/404?w=bad',
    });
    expect(response.statusCode).toBe(400);
  });

  it('GET /mock/users should return array', async () => {
    const response = await app.inject({ method: 'GET', url: '/mock/users' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as unknown[];
    expect(body.length).toBe(10);
  });

  it('GET /mock/users?count=abc should return 400', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/mock/users?count=abc',
    });
    expect(response.statusCode).toBe(400);
  });

  it('GET /2000/100.webp should reject raster size above max', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/1024/1024.webp',
    });
    expect(response.statusCode).toBe(200);

    const tooLarge = await app.inject({
      method: 'GET',
      url: '/1025/600.webp',
    });
    expect(tooLarge.statusCode).toBe(400);
  });

  it('GET /qr/demo/128 should return pseudo qr svg with headers', async () => {
    const response = await app.inject({ method: 'GET', url: '/qr/demo/128' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.headers['x-devimage-pseudo-code']).toBe('qr');
    expect(response.headers['cache-control']).toContain('immutable');
    expect(response.body).toContain('<svg');
  });

  it('GET /qr/demo/128 should be deterministic', async () => {
    const a = await app.inject({ method: 'GET', url: '/qr/demo/128' });
    const b = await app.inject({ method: 'GET', url: '/qr/demo/128' });
    expect(a.body).toBe(b.body);
  });

  it('GET /qr/demo/128.webp should return webp raster', async () => {
    const response = await app.inject({ method: 'GET', url: '/qr/demo/128.webp' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
    expect(response.headers['x-devimage-pseudo-code']).toBe('qr');
  });

  it('GET /qr/demo/320/80?variant=dots should include circles', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/qr/demo/320/80?variant=dots',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<circle');
  });

  it('GET /qr/demo/99999 should reject invalid size', async () => {
    const response = await app.inject({ method: 'GET', url: '/qr/demo/99999' });
    expect(response.statusCode).toBe(400);
  });

  it('GET /barcode/sku-mock/320/80 should return pseudo barcode svg', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/barcode/sku-mock/320/80',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.headers['x-devimage-pseudo-code']).toBe('barcode');
    expect(response.body).toContain('width="320"');
  });

  it('GET /barcode/sku-mock/320/80.webp should return webp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/barcode/sku-mock/320/80.webp',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
  });

  it('GET /code/styles should return catalog json', async () => {
    const response = await app.inject({ method: 'GET', url: '/code/styles' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(CODE_STYLES_CATALOG);
  });

  it('GET /qr/demo/128?fg=bad should reject invalid color', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/qr/demo/128?fg=not-a-hex',
    });
    expect(response.statusCode).toBe(400);
  });

  it('GET /barcode/demo/320/80 should differ across seeds', async () => {
    const a = await app.inject({ method: 'GET', url: '/barcode/sku-a/320/80' });
    const b = await app.inject({ method: 'GET', url: '/barcode/sku-b/320/80' });
    expect(a.body).not.toBe(b.body);
  });

  it('GET /barcode/demo/320/80?variant=ean13 should be deterministic', async () => {
    const a = await app.inject({
      method: 'GET',
      url: '/barcode/demo/320/80?variant=ean13',
    });
    const b = await app.inject({
      method: 'GET',
      url: '/barcode/demo/320/80?variant=ean13',
    });
    expect(a.body).toBe(b.body);
  });

  it('GET /qr/checkout/256 should differ from demo seed', async () => {
    const checkout = await app.inject({ method: 'GET', url: '/qr/checkout/256' });
    const demo = await app.inject({ method: 'GET', url: '/qr/demo/256' });
    expect(checkout.body).not.toBe(demo.body);
  });

  it('GET /qr/demo/128.png should return png raster', async () => {
    const response = await app.inject({ method: 'GET', url: '/qr/demo/128.png' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
    expect(response.rawPayload.length).toBeGreaterThan(100);
  });

  it('GET /barcode/sku-mock/320/80.png should return png raster', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/barcode/sku-mock/320/80.png',
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
  });

  it('GET /barcode/demo/320/80?variant=invalid should return 400', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/barcode/demo/320/80?variant=invalid',
    });
    expect(response.statusCode).toBe(400);
  });

  it('GET /code/styles should include cache-control for catalog', async () => {
    const response = await app.inject({ method: 'GET', url: '/code/styles' });
    expect(response.headers['cache-control']).toContain('max-age=3600');
  });

  it.each(PSEUDO_CODE_GOLDEN_ROUTES)(
    'GET $url should match golden hash ($key)',
    async ({ url, key }) => {
      const response = await app.inject({ method: 'GET', url });
      expect(response.statusCode).toBe(200);
      expect(sha256Svg(response.body)).toBe(PSEUDO_CODE_GOLDEN_HASHES[key]);
    },
  );
});
