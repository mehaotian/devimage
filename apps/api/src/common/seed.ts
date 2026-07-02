/**
 * FNV-1a 32 位哈希（与 avatar-assets 脚本保持一致）
 */
export function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * 由 seed 与槽位名生成 [0, 1) 确定性浮点
 */
export function seedToUnit(seed: string, slot = ''): number {
  const hash = fnv1a32(`${seed}:${slot}`);
  return hash / 0x1_0000_0000;
}

/**
 * 由 seed 与槽位生成整数范围 [min, max)
 */
export function seedToInt(seed: string, slot: string, min: number, max: number): number {
  const unit = seedToUnit(seed, slot);
  return min + Math.floor(unit * (max - min));
}
