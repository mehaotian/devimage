import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoManifestService } from './photo-manifest.service';
import type { PhotoManifestEntry } from './photo.types';

const sample: PhotoManifestEntry[] = [
  {
    id: 1,
    pexels_id: 100,
    cat: '美食',
    scenes: ['food'],
    mock_priority: 1,
    cos_key: 'assets/seed-pack/美食/pexels_100.jpeg',
  },
  {
    id: 2,
    pexels_id: 200,
    cat: '电商主图',
    scenes: ['product'],
    mock_priority: 1,
    cos_key: 'assets/seed-pack/电商主图/pexels_200.jpeg',
  },
  {
    id: 3,
    pexels_id: 300,
    cat: '电商主图',
    scenes: ['product'],
    mock_priority: 1,
    cos_key: 'assets/seed-pack/电商主图/pexels_300.jpeg',
  },
];

/**
 * 构造测试 manifest 桩
 */
function createManifestStub(entries: PhotoManifestEntry[]): PhotoManifestService {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const poolFor = (scene?: string) => {
    if (scene === 'product') {
      return entries.filter((e) => e.scenes.includes('product')).map((e) => e.id);
    }
    return entries.map((e) => e.id);
  };
  return {
    isReady: () => entries.length > 0,
    getById: (id: number) => byId.get(id),
    getByCat: (cat: string) => entries.filter((e) => e.cat === cat),
    getMockPool: (scene: string) => poolFor(scene),
    getScenePool: (scene: string) => poolFor(scene),
    getAll: () => entries,
    getCategories: () => [],
    getScenesMeta: () => [],
    load: () => undefined,
  } as unknown as PhotoManifestService;
}

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(() => {
    service = new PhotoService(createManifestStub(sample));
  });

  it('should resolve by global id', () => {
    const photo = service.resolvePhoto({}, 1);
    expect(photo.id).toBe(1);
  });

  it('should throw when id missing', () => {
    expect(() => service.resolvePhoto({}, 999)).toThrow(NotFoundException);
  });

  it('should resolve product scene by seed deterministically', () => {
    const a = service.resolvePhoto({ scene: 'product', seed: 'sku-001' });
    const b = service.resolvePhoto({ scene: 'product', seed: 'sku-001' });
    expect(a.id).toBe(b.id);
    expect(a.scenes).toContain('product');
  });

  it('should reject deprecated pool id query', () => {
    expect(() => service.resolvePhoto({ scene: 'product', id: '1' })).toThrow(BadRequestException);
  });

  it('should build mock photo url with seed', () => {
    const url = service.buildPhotoUrl('http://localhost:3000', 400, 400, {
      scene: 'product',
      seed: 'product-5',
    });
    expect(url).toBe('http://localhost:3000/photo/400/400?scene=product&seed=product-5');
  });
});
