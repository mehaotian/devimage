#!/usr/bin/env node
/**
 * 将白底 PNG 转为透明底（适用于 #FFFFFF 背景的 Sprite 部件）
 *
 * @example
 * node scripts/remove-white-bg.mjs --dir assets/devimage-cn/faces
 * node scripts/remove-white-bg.mjs --dir assets/devimage-cn/faces --threshold 240
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parseArgs } from './lib/seed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 对单张 PNG 做白底转透明
 * @param {string} filePath - 文件路径
 * @param {number} threshold - RGB 均高于此值视为背景（0–255）
 */
async function matteWhiteBackground(filePath, threshold) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(filePath);
}

/**
 * 主流程：遍历目录内 PNG 并抠图
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dirRel = args.dir;
  const threshold = Number(args.threshold ?? 245);

  if (!dirRel || typeof dirRel !== 'string') {
    console.error('缺少 --dir，例如 assets/devimage-cn/faces');
    process.exit(1);
  }

  const dirPath = path.resolve(ROOT, dirRel);
  const entries = await fs.readdir(dirPath);
  const pngFiles = entries.filter((name) => name.toLowerCase().endsWith('.png')).sort();

  if (pngFiles.length === 0) {
    console.error(`目录内无 PNG: ${dirPath}`);
    process.exit(1);
  }

  console.log(`抠图: ${dirPath}，阈值 ${threshold}，共 ${pngFiles.length} 张`);

  for (const name of pngFiles) {
    const filePath = path.join(dirPath, name);
    await matteWhiteBackground(filePath, threshold);
    console.log(`  ✓ ${name}`);
  }

  console.log('完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
