import { randomInt } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { seedToInt } from '../common/seed';
import type { PhotoManifestEntry, PhotoSceneSlug } from './photo.types';
import { MOCK_SCENE_BY_RESOURCE } from './photo.types';
import { PhotoManifestService } from './photo-manifest.service';
import type { PhotoQuery } from './photo-query';
import { assertNoLegacyPoolId, parsePhotoScene } from './photo-query';

/**
 * 照片选取与 URL 构建（seed 语义与占位图一致）
 */
@Injectable()
export class PhotoService {
  constructor(private readonly manifest: PhotoManifestService) {}

  /**
   * manifest 是否就绪
   */
  isReady(): boolean {
    return this.manifest.isReady();
  }

  /**
   * 按 query 解析目标照片（/photo 仅 seed；globalId 仅供 picsum /id 兼容）
   */
  resolvePhoto(query: PhotoQuery, globalId?: number): PhotoManifestEntry {
    if (globalId !== undefined) {
      const byGlobal = this.manifest.getById(globalId);
      if (!byGlobal) {
        throw new NotFoundException(`Photo id ${globalId} not found`);
      }
      return byGlobal;
    }

    assertNoLegacyPoolId(query.id);

    const scene = parsePhotoScene(query.scene);
    const cat = query.cat?.trim();
    const seed = query.seed?.trim() || undefined;

    if (cat) {
      const list = this.manifest.getByCat(cat);
      if (list.length === 0) {
        throw new NotFoundException(`Category not found: ${cat}`);
      }
      const idx = this.pickPoolIndex(seed, list.length, `photo:cat:${cat}`);
      return list[idx]!;
    }

    const pool = scene
      ? this.manifest.getScenePool(scene)
      : this.manifest.getMockPool('gallery');

    if (pool.length === 0) {
      throw new NotFoundException('Photo pool empty');
    }

    const slot = `photo:scene:${scene ?? 'gallery'}`;
    const photoId = pool[this.pickPoolIndex(seed, pool.length, slot)]!;
    const entry = this.manifest.getById(photoId);
    if (!entry) {
      throw new NotFoundException(`Photo id ${photoId} not found`);
    }
    return entry;
  }

  /**
   * 构建 /photo URL（供 Mock JSON 使用，仅 seed）
   */
  buildPhotoUrl(
    baseUrl: string,
    w: number,
    h: number,
    opts: { scene: PhotoSceneSlug; seed: string },
  ): string {
    const base = baseUrl.replace(/\/$/, '');
    const params = new URLSearchParams();
    params.set('scene', opts.scene);
    params.set('seed', opts.seed);
    return `${base}/photo/${w}/${h}?${params.toString()}`;
  }

  /**
   * Mock 资源默认 scene
   */
  getMockScene(resource: keyof typeof MOCK_SCENE_BY_RESOURCE): PhotoSceneSlug {
    return MOCK_SCENE_BY_RESOURCE[resource];
  }

  /**
   * picsum 风格列表分页
   */
  listPhotos(page: number, limit: number, cat?: string): {
    photos: Array<Record<string, unknown>>;
    total: number;
    page: number;
    limit: number;
  } {
    const all = cat ? this.manifest.getByCat(cat) : this.manifest.getAll();
    const total = all.length;
    const start = (page - 1) * limit;
    const slice = all.slice(start, start + limit);
    const base = (process.env.DEVIMAGE_PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    return {
      total,
      page,
      limit,
      photos: slice.map((p) => ({
        id: p.id,
        author: p.photographer ?? 'Unknown',
        width: p.width,
        height: p.height,
        url: `${base}/id/${p.id}/800/600`,
        download_url: `${base}/id/${p.id}/1200/800`,
        cat: p.cat,
        scenes: p.scenes,
      })),
    };
  }

  /**
   * 单条 info（picsum /id/:id/info 预留）
   */
  getPhotoInfo(id: number): Record<string, unknown> {
    const entry = this.manifest.getById(id);
    if (!entry) {
      throw new NotFoundException(`Photo id ${id} not found`);
    }
    const base = (process.env.DEVIMAGE_PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    return {
      id: entry.id,
      author: entry.photographer,
      width: entry.width,
      height: entry.height,
      url: `${base}/id/${entry.id}/800/600`,
      cat: entry.cat,
      scenes: entry.scenes,
      pexels_url: entry.pexels_url,
    };
  }

  /**
   * 从池内选索引：有 seed 则确定性，无 seed 则随机
   */
  private pickPoolIndex(seed: string | undefined, size: number, slot: string): number {
    if (size <= 0) {
      return 0;
    }
    if (seed) {
      return seedToInt(seed, slot, 0, size);
    }
    return randomInt(size);
  }
}
