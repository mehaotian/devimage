/**
 * 真实照片 manifest 单条记录
 */
export interface PhotoManifestEntry {
  id: number;
  pexels_id: number;
  cat: string;
  tier?: string;
  shot_type?: string;
  orientation?: string;
  aspect?: string;
  scenes: string[];
  alias_group?: string | null;
  mock_priority: number;
  usage?: string[];
  width?: number;
  height?: number;
  avg_color?: string;
  photographer?: string;
  pexels_url?: string;
  cos_key: string;
}

/**
 * manifest photos.json 根结构
 */
export interface PhotoManifestFile {
  version: number;
  generated_at: string;
  total: number;
  photos: PhotoManifestEntry[];
}

/**
 * scene 池定义
 */
export interface SceneManifestFile {
  version: number;
  scenes: Array<{
    slug: string;
    label: string;
    categories: string[];
    photo_count: number;
    mock_pool_count: number;
    mock_field?: string;
  }>;
  pools: {
    all: Record<string, number[]>;
    mock: Record<string, number[]>;
  };
}

/**
 * 分类目录
 */
export interface CategoryManifestFile {
  version: number;
  total: number;
  categories: Array<{
    slug: string;
    label: string;
    tier?: string;
    count: number;
    shot_type?: string;
    scenes: string[];
    alias_group?: string | null;
    mock_priority: number;
    usage: string[];
    description?: string;
  }>;
  alias_groups: Record<string, string[]>;
}

/** 标准 scene slug 列表 */
export const PHOTO_SCENE_SLUGS = [
  'product',
  'food',
  'news',
  'article',
  'travel',
  'hotel',
  'banner',
  'social',
  'education',
  'health',
  'realestate',
  'business',
  'game',
  'promo',
  'gallery',
] as const;

export type PhotoSceneSlug = (typeof PHOTO_SCENE_SLUGS)[number];

/** Mock 默认 scene 映射 */
export const MOCK_SCENE_BY_RESOURCE: Record<string, PhotoSceneSlug> = {
  products: 'product',
  posts: 'news',
};
