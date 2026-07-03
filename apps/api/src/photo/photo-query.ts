import { BadRequestException } from '@nestjs/common';
import type { PhotoSceneSlug } from './photo.types';
import { PHOTO_SCENE_SLUGS } from './photo.types';

/**
 * /photo 查询参数
 */
export interface PhotoQuery {
  /** 业务场景 */
  scene?: string;
  /** 视觉分类（中文） */
  cat?: string;
  /** 确定性 seed；省略则每次随机选图 */
  seed?: string;
  /** @deprecated 已废弃，请使用 seed */
  id?: string;
  /** 灰度 0|1 */
  grayscale?: string;
  /** 模糊 1–10 */
  blur?: string;
  /** 输出 webp|jpeg|png */
  format?: string;
}

/**
 * 是否携带有效 seed
 */
export function hasPhotoSeed(query: Pick<PhotoQuery, 'seed'>): boolean {
  return Boolean(query.seed?.trim());
}

/**
 * 拒绝已废弃的 pool id 参数
 */
export function assertNoLegacyPoolId(value: string | undefined): void {
  if (value === undefined || value === '') {
    return;
  }
  throw new BadRequestException(
    'Query id is deprecated for /photo. Use seed for deterministic images, or omit seed for random.',
  );
}

/**
 * 解析 scene slug
 */
export function parsePhotoScene(value: string | undefined): PhotoSceneSlug | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if ((PHOTO_SCENE_SLUGS as readonly string[]).includes(value)) {
    return value as PhotoSceneSlug;
  }
  throw new BadRequestException(
    `Invalid scene: ${value}. Use one of: ${PHOTO_SCENE_SLUGS.join(', ')}`,
  );
}

/**
 * @deprecated /photo 已改用 seed，保留仅供历史引用
 */
export function parsePhotoPoolId(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1 || num > 100) {
    throw new BadRequestException('Invalid id: must be between 1 and 100');
  }
  return num;
}

/**
 * 解析 blur 强度
 */
export function parsePhotoBlur(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1 || num > 10) {
    throw new BadRequestException('Invalid blur: must be between 1 and 10');
  }
  return num;
}

/**
 * 解析 grayscale
 */
export function parsePhotoGrayscale(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

/**
 * 解析输出格式
 */
export function parsePhotoFormat(value: string | undefined): 'webp' | 'jpeg' | 'png' {
  if (value === undefined || value === '' || value === 'webp') {
    return 'webp';
  }
  if (value === 'jpeg' || value === 'jpg') {
    return 'jpeg';
  }
  if (value === 'png') {
    return 'png';
  }
  throw new BadRequestException('Invalid format: use webp, jpeg, or png');
}
