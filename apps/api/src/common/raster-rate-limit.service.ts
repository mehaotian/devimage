import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateBucket {
  count: number;
  resetAt: number;
}

/** 单 IP 栅格化限流：60 次/分钟（与 Nginx 层互补） */
const RASTER_LIMIT = 60;
const RASTER_TTL_MS = 60_000;

/**
 * 进程内栅格化限流（覆盖 ?format=webp 等所有栅格路径）
 */
@Injectable()
export class RasterRateLimitService {
  private readonly buckets = new Map<string, RateBucket>();

  /**
   * 校验 clientKey（通常为 IP）未超出栅格配额
   */
  assertWithinLimit(clientKey: string): void {
    const key = clientKey || 'unknown';
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + RASTER_TTL_MS });
      return;
    }

    if (bucket.count >= RASTER_LIMIT) {
      throw new HttpException(
        'Raster rate limit exceeded. Try again later or use SVG.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
  }

  /**
   * 重置限流状态（测试用）
   */
  reset(): void {
    this.buckets.clear();
  }
}
