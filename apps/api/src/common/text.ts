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
