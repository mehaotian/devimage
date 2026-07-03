import { BadRequestException, StreamableFile } from '@nestjs/common';
import type { SvgRasterFormat } from '../common/svg-raster';

/** 伪码栅格路由 HTTP 限流：60 次/分钟 */
export const PSEUDO_CODE_RASTER_THROTTLE = { default: { limit: 60, ttl: 60_000 } } as const;

/** 伪码 seed 路由缓存策略 */
export const PSEUDO_CODE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * 将栅格 buffer 封装为 inline StreamableFile
 */
export function toPseudoCodeStreamableFile(format: SvgRasterFormat, buffer: Buffer): StreamableFile {
  const contentType = format === 'webp' ? 'image/webp' : 'image/png';
  return new StreamableFile(buffer, {
    type: contentType,
    disposition: 'inline',
  });
}

/**
 * 捕获伪码路由参数错误并转为 400
 */
export function runPseudoCodeHandler<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    throw new BadRequestException(err instanceof Error ? err.message : 'Invalid parameters');
  }
}

/**
 * 异步版伪码路由错误封装
 */
export async function runPseudoCodeHandlerAsync<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new BadRequestException(err instanceof Error ? err.message : 'Invalid parameters');
  }
}
