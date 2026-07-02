/**
 * FNV-1a 32 位哈希（与 API 侧 seed 索引保持一致）
 * @param {string} str - 输入字符串
 * @returns {number} 无符号 32 位整数
 */
export function fnv1a32(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * 由 seed 与槽位名计算部件文件编号（1-based，三位补零）
 * @param {string} seed - 用户 seed
 * @param {string} slot - 槽位名，如 faces
 * @param {number} count - 该槽位 PNG 总数
 * @returns {number} 1 … count
 */
export function seedToSlotIndex(seed, slot, count) {
  const hash = fnv1a32(`${seed}:${slot}`);
  return (hash % count) + 1;
}

/**
 * 格式化为三位文件 id
 * @param {number} index - 1-based 索引
 * @returns {string} 如 "007"
 */
export function formatPartId(index) {
  return String(index).padStart(3, '0');
}

/**
 * 解析 `--key value` 形式 CLI 参数
 * @param {string[]} argv - process.argv.slice(2)
 * @returns {Record<string, string | boolean>} 参数表
 */
export function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--') {
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

/**
 * 解析 manifest JSON 路径
 * @param {string} [style] - style 名，默认 devimage-cn
 * @returns {URL} manifest 文件 URL
 */
export function resolveManifestUrl(style = 'devimage-cn') {
  return new URL(`../manifest/${style}.json`, import.meta.url);
}
