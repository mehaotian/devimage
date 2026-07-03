/**
 * 提取显示字符（中文首字 / 英文首字母大写）
 */
export function extractInitialChar(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  const first = [...trimmed][0] ?? '?';
  if (/[\u4e00-\u9fff]/.test(first)) {
    return first;
  }
  return first.toUpperCase();
}

/** 路由 seed 最大长度（与 text 参数一致） */
export const MAX_ROUTE_SEED_LENGTH = 50;

/**
 * 解码路由 path 中的 seed（支持 URL 编码中文等）
 */
export function decodeRouteSeed(seed: string): string {
  try {
    return decodeURIComponent(seed);
  } catch {
    throw new Error(`Invalid seed encoding: ${seed}`);
  }
}

/**
 * 解析并校验路由 seed（解码 + 非空 + 长度上限）
 */
export function parseRouteSeed(raw: string): string {
  const seed = decodeRouteSeed(raw).trim();
  if (!seed) {
    throw new Error('Invalid seed: must not be empty');
  }
  if (seed.length > MAX_ROUTE_SEED_LENGTH) {
    throw new Error(`Invalid seed: max length is ${MAX_ROUTE_SEED_LENGTH}`);
  }
  return seed;
}
