import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

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
    const body = response.json() as { status: string; checks: unknown[] };
    expect(body.status).toBe('ok');
    expect(body.checks.length).toBeGreaterThan(0);
  });

  it('GET /800/600 should return svg', async () => {
    const response = await app.inject({ method: 'GET', url: '/800/600' });
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
});
