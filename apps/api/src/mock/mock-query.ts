import { BadRequestException } from '@nestjs/common';
import { parsePositiveInt } from '../common/utils';

/** Mock 资源池最大条数 */
export const MOCK_POOL_MAX = 100;

/**
 * 解析 Mock 分页 query（JSONPlaceholder 风格 `_page` / `_limit`）
 */
export function parseMockPagination(
  page?: string,
  limit?: string,
): { page: number; limit: number } | null {
  if ((page === undefined || page === '') && (limit === undefined || limit === '')) {
    return null;
  }

  try {
    const resolvedPage = page ? parsePositiveInt(page, '_page', 1, 1000) : 1;
    const resolvedLimit = limit ? parsePositiveInt(limit, '_limit', 1, 100) : 10;
    return { page: resolvedPage, limit: resolvedLimit };
  } catch (err) {
    throw new BadRequestException(
      err instanceof Error ? err.message : 'Invalid pagination',
    );
  }
}

/**
 * 对固定池做分页切片（1-based page）
 */
export function sliceMockPool<T>(
  buildItem: (index: number) => T,
  page: number,
  limit: number,
  poolMax = MOCK_POOL_MAX,
): T[] {
  const start = (page - 1) * limit;
  if (start >= poolMax) {
    return [];
  }

  const end = Math.min(start + limit, poolMax);
  return Array.from({ length: end - start }, (_, i) => buildItem(start + i + 1));
}
