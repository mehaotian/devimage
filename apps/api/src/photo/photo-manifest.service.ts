import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  CategoryManifestFile,
  PhotoManifestEntry,
  PhotoManifestFile,
  PhotoSceneSlug,
  SceneManifestFile,
} from './photo.types';

/**
 * 加载并索引 photo manifest（本地 JSON）
 */
@Injectable()
export class PhotoManifestService implements OnModuleInit {
  private readonly logger = new Logger(PhotoManifestService.name);

  private photos: PhotoManifestEntry[] = [];

  private byId = new Map<number, PhotoManifestEntry>();

  private byCat = new Map<string, PhotoManifestEntry[]>();

  private scenePools: Record<string, number[]> = {};

  private sceneMockPools: Record<string, number[]> = {};

  private categories: CategoryManifestFile['categories'] = [];

  private scenesMeta: SceneManifestFile['scenes'] = [];

  /**
   * 模块初始化时加载 manifest
   */
  onModuleInit(): void {
    this.load();
  }

  /**
   * 重新加载 manifest（测试用）
   */
  load(): void {
    const dir = this.resolveManifestDir();
    const photosPath = join(dir, 'photos.json');
    if (!existsSync(photosPath)) {
      this.logger.warn(`Photo manifest not found: ${photosPath}`);
      return;
    }
    const photosFile = JSON.parse(readFileSync(photosPath, 'utf-8')) as PhotoManifestFile;
    this.photos = photosFile.photos ?? [];
    this.byId.clear();
    this.byCat.clear();
    for (const p of this.photos) {
      this.byId.set(p.id, p);
      const list = this.byCat.get(p.cat) ?? [];
      list.push(p);
      this.byCat.set(p.cat, list);
    }
    const scenesPath = join(dir, 'scenes.json');
    if (existsSync(scenesPath)) {
      const scenesFile = JSON.parse(readFileSync(scenesPath, 'utf-8')) as SceneManifestFile;
      this.scenePools = scenesFile.pools?.all ?? {};
      this.sceneMockPools = scenesFile.pools?.mock ?? {};
      this.scenesMeta = scenesFile.scenes ?? [];
    }
    const catPath = join(dir, 'categories.json');
    if (existsSync(catPath)) {
      const catFile = JSON.parse(readFileSync(catPath, 'utf-8')) as CategoryManifestFile;
      this.categories = catFile.categories ?? [];
    }
    this.logger.log(`Photo manifest loaded: ${this.photos.length} photos, ${this.categories.length} categories`);
  }

  /**
   * manifest 是否可用
   */
  isReady(): boolean {
    return this.photos.length > 0;
  }

  /**
   * 按全局 id 取条目
   */
  getById(id: number): PhotoManifestEntry | undefined {
    return this.byId.get(id);
  }

  /**
   * 全部照片
   */
  getAll(): PhotoManifestEntry[] {
    return this.photos;
  }

  /**
   * 分类列表
   */
  getCategories(): CategoryManifestFile['categories'] {
    return this.categories;
  }

  /**
   * scene 元信息
   */
  getScenesMeta(): SceneManifestFile['scenes'] {
    return this.scenesMeta;
  }

  /**
   * 按 cat 取照片列表
   */
  getByCat(cat: string): PhotoManifestEntry[] {
    return this.byCat.get(cat) ?? [];
  }

  /**
   * 解析 scene 对应 photo id 池（mock 默认池）
   */
  getMockPool(scene: PhotoSceneSlug): number[] {
    return this.sceneMockPools[scene] ?? this.sceneMockPools.gallery ?? [];
  }

  /**
   * 解析 scene 全量池
   */
  getScenePool(scene: PhotoSceneSlug): number[] {
    return this.scenePools[scene] ?? this.scenePools.gallery ?? [];
  }

  /**
   * manifest 目录（优先 env，其次 dist/data/photo）
   */
  private resolveManifestDir(): string {
    const fromEnv = process.env.PHOTO_MANIFEST_DIR;
    if (fromEnv) {
      if (fromEnv.startsWith('/')) {
        return fromEnv;
      }
      const cwdPath = join(process.cwd(), fromEnv);
      if (existsSync(join(cwdPath, 'photos.json'))) {
        return cwdPath;
      }
    }
    const distPath = join(__dirname, '..', 'data', 'photo');
    if (existsSync(join(distPath, 'photos.json'))) {
      return distPath;
    }
    return join(process.cwd(), 'data', 'photo');
  }
}
