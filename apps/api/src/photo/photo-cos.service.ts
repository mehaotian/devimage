import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import type { PhotoManifestEntry } from './photo.types';
import { PhotoManifestService } from './photo-manifest.service';

/** 缓存键后缀 */
interface RenderVariant {
  w: number;
  h: number;
  grayscale: boolean;
  blur?: number;
  format: 'webp' | 'jpeg' | 'png';
}

/**
 * COS 客户端封装：上传缓存、生成访问 URL
 */
@Injectable()
export class PhotoCosService {
  private readonly logger = new Logger(PhotoCosService.name);

  private client: CosClientLike | null = null;

  /**
   * 是否已配置 COS
   */
  isConfigured(): boolean {
    return Boolean(
      process.env.TENCENT_SECRET_ID &&
        process.env.TENCENT_SECRET_KEY &&
        process.env.COS_BUCKET &&
        process.env.COS_REGION,
    );
  }

  /**
   * 构建原图/缓存 COS Key
   */
  buildCacheKey(photoId: number, variant: RenderVariant): string {
    const prefix = (process.env.COS_PHOTO_PREFIX ?? 'photos/').replace(/^\//, '');
    const blurPart = variant.blur ? `_blur${variant.blur}` : '';
    const grayPart = variant.grayscale ? '_gray' : '';
    return `${prefix}${photoId}/${variant.w}x${variant.h}${grayPart}${blurPart}.${variant.format}`;
  }

  /**
   * 获取可访问 URL（CDN 优先，否则 COS 默认域名，否则 null）
   */
  resolvePublicUrl(cosKey: string): string | null {
    const cdn = process.env.COS_CDN_DOMAIN?.replace(/\/$/, '');
    if (cdn) {
      return `${cdn}/${cosKey.replace(/^\//, '')}`;
    }
    const publicBase = process.env.COS_PUBLIC_BASE?.replace(/\/$/, '');
    if (publicBase) {
      return `${publicBase}/${cosKey.replace(/^\//, '')}`;
    }
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;
    if (bucket && region && process.env.PHOTO_USE_COS_DIRECT_URL === '1') {
      return `https://${bucket}.cos.${region}.myqcloud.com/${cosKey.replace(/^\//, '')}`;
    }
    return null;
  }

  /**
   * 构建 COS 请求公共参数
   */
  private buildObjectParams(key: string): { Bucket: string; Region: string; Key: string } | null {
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;
    if (!bucket || !region) {
      return null;
    }
    return {
      Bucket: bucket,
      Region: region,
      Key: key.replace(/^\//, ''),
    };
  }

  /**
   * 格式化 COS SDK 错误信息
   */
  private formatCosError(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (err && typeof err === 'object') {
      const e = err as { code?: string; message?: string; statusCode?: number };
      return [e.code, e.message, e.statusCode ? `HTTP ${e.statusCode}` : ''].filter(Boolean).join(' — ');
    }
    return String(err);
  }

  /**
   * 检查 COS 缓存是否存在
   */
  async headExists(key: string): Promise<boolean> {
    const client = await this.getClient();
    const params = this.buildObjectParams(key);
    if (!client || !params) {
      return false;
    }
    try {
      await client.headObject(params);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 上传缓存图
   */
  async putBuffer(key: string, body: Buffer, contentType: string): Promise<boolean> {
    const client = await this.getClient();
    const params = this.buildObjectParams(key);
    if (!client || !params) {
      return false;
    }
    try {
      await client.putObject({
        ...params,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      });
      return true;
    } catch (err) {
      this.logger.warn(`COS putObject failed: ${key} — ${this.formatCosError(err)}`);
      return false;
    }
  }

  /**
   * 从 COS 读取原图
   */
  async getObjectBuffer(key: string): Promise<Buffer | null> {
    const client = await this.getClient();
    const params = this.buildObjectParams(key);
    if (!client || !params) {
      return null;
    }
    try {
      const result = await client.getObject(params);
      const body = result.Body;
      if (!body) {
        return null;
      }
      if (Buffer.isBuffer(body)) {
        return body;
      }
      if (body instanceof Uint8Array) {
        return Buffer.from(body);
      }
      return Buffer.from(String(body));
    } catch (err) {
      this.logger.warn(`COS getObject failed: ${key} — ${this.formatCosError(err)}`);
      return null;
    }
  }

  /**
   * 懒加载 COS SDK
   */
  private async getClient(): Promise<CosClientLike | null> {
    if (!this.isConfigured()) {
      return null;
    }
    if (this.client) {
      return this.client;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const COS = require('cos-nodejs-sdk-v5') as new (opts: CosCtorOptions) => CosClientLike;
      this.client = new COS({
        SecretId: process.env.TENCENT_SECRET_ID,
        SecretKey: process.env.TENCENT_SECRET_KEY,
        Region: process.env.COS_REGION,
      });
      return this.client;
    } catch (err) {
      this.logger.warn(`COS SDK unavailable: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }
}

interface CosCtorOptions {
  SecretId?: string;
  SecretKey?: string;
  Region?: string;
}

interface CosClientLike {
  headObject(opts: { Bucket: string; Region: string; Key: string }): Promise<unknown>;
  getObject(opts: { Bucket: string; Region: string; Key: string }): Promise<{ Body?: Buffer | Uint8Array | string }>;
  putObject(opts: {
    Bucket: string;
    Region: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
    CacheControl?: string;
  }): Promise<unknown>;
}

/**
 * 真实照片渲染：COS 原图 → Sharp 裁剪 → 可选写 COS 缓存
 */
@Injectable()
export class PhotoRenderService {
  constructor(
    private readonly manifest: PhotoManifestService,
    private readonly cos: PhotoCosService,
  ) {}

  /**
   * 渲染照片并返回 buffer + contentType
   */
  async render(
    entry: PhotoManifestEntry,
    variant: RenderVariant,
  ): Promise<{ buffer: Buffer; contentType: string; cacheKey: string }> {
    const cacheKey = this.cos.buildCacheKey(entry.id, variant);
    const source = await this.resolveSourceBuffer(entry);
    if (!source) {
      throw new NotFoundException(`Source image not found for photo id=${entry.id}`);
    }

    let pipeline = sharp(source).rotate().resize(variant.w, variant.h, {
      fit: 'cover',
      position: 'centre',
    });
    if (variant.grayscale) {
      pipeline = pipeline.grayscale();
    }
    if (variant.blur) {
      pipeline = pipeline.blur(Math.min(variant.blur, 10));
    }

    let buffer: Buffer;
    let contentType: string;
    if (variant.format === 'png') {
      buffer = await pipeline.png().toBuffer();
      contentType = 'image/png';
    } else if (variant.format === 'jpeg') {
      buffer = await pipeline.jpeg({ quality: 85 }).toBuffer();
      contentType = 'image/jpeg';
    } else {
      buffer = await pipeline.webp({ quality: 85 }).toBuffer();
      contentType = 'image/webp';
    }

    if (this.cos.isConfigured()) {
      await this.cos.putBuffer(cacheKey, buffer, contentType);
    }

    return { buffer, contentType, cacheKey };
  }

  /**
   * 从 COS 读取原图 buffer（生产仅 cos_key，不读本地路径）
   */
  private async resolveSourceBuffer(entry: PhotoManifestEntry): Promise<Buffer | null> {
    if (!entry.cos_key || !this.cos.isConfigured()) {
      return null;
    }
    return this.cos.getObjectBuffer(entry.cos_key);
  }

  /**
   * 生成 etag
   */
  buildEtag(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }
}
