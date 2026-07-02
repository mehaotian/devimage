#!/usr/bin/env node
/**
 * 按 manifest 随机 seed 组合各层 PNG，输出验收预览图
 *
 * @example
 * node scripts/validate-composite.mjs --style devimage-cn --samples 10
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { formatPartId, parseArgs, resolveManifestUrl, seedToSlotIndex } from './lib/seed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 读取并解析 manifest
 * @param {string} style - style 名
 * @returns {Promise<object>} manifest 对象
 */
async function loadManifest(style) {
  const manifestUrl = resolveManifestUrl(style);
  const raw = await fs.readFile(manifestUrl, 'utf8');
  return JSON.parse(raw);
}

/**
 * HSL 转 hex（与 API utils 一致）
 * @param {number} h - 色相 0–360
 * @param {number} s - 饱和度 0–100
 * @param {number} l - 亮度 0–100
 * @returns {string} 六位 hex，无 #
 */
function hslToHex(h, s, l) {
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

/**
 * seed 转背景色 hex
 * @param {string} seed - seed 字符串
 * @param {object} bg - manifest.background
 * @returns {string} 六位 hex
 */
function seedToBackgroundHex(seed, bg) {
  if (bg.fromSeed === 'fixed' && bg.color) {
    return bg.color;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, bg.saturation ?? 55, bg.lightness ?? 55);
}

/**
 * 解析部件文件绝对路径
 * @param {string} basePath - manifest basePath
 * @param {string} pathTemplate - 如 faces/{id}.png
 * @param {number} index - 1-based
 * @returns {string} 绝对路径
 */
function resolvePartPath(basePath, pathTemplate, index) {
  const rel = pathTemplate.replace('{id}', formatPartId(index));
  return path.resolve(ROOT, 'manifest', basePath, rel);
}

/**
 * 生成圆形背景 RGBA buffer
 * @param {number} size - 边长
 * @param {string} hex - 背景色
 * @returns {Promise<Buffer>} PNG buffer
 */
async function createCircleBackground(size, hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const radius = size / 2;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`,
    `<circle cx="${radius}" cy="${radius}" r="${radius}" fill="rgb(${r},${g},${b})"/>`,
    `</svg>`,
  ].join('');

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * 组合单个 seed 的所有图层
 * @param {object} manifest - manifest
 * @param {string} seed - 测试 seed
 * @param {number} canvas - 画布边长
 * @returns {Promise<Buffer>} 合成 PNG
 */
async function compositeAvatar(manifest, seed, canvas) {
  const bgHex = seedToBackgroundHex(seed, manifest.background);
  const layers = [...manifest.layers].sort((a, b) => a.z - b.z);

  /** @type {import('sharp').OverlayOptions[]} */
  const overlays = [];

  for (const layer of layers) {
    const index = seedToSlotIndex(seed, layer.slot, layer.count);
    const partPath = resolvePartPath(manifest.basePath, layer.path, index);

    try {
      await fs.access(partPath);
    } catch {
      console.warn(`  跳过缺失部件: ${partPath}`);
      continue;
    }

    overlays.push({ input: partPath, top: 0, left: 0 });
  }

  const base = await createCircleBackground(canvas, bgHex);
  return sharp(base).composite(overlays).png().toBuffer();
}

/**
 * 主流程
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const style = typeof args.style === 'string' ? args.style : 'devimage-cn';
  const samples = Number(args.samples ?? 10);
  const outDir = path.resolve(ROOT, typeof args.out === 'string' ? args.out : 'out/validate');

  const manifest = await loadManifest(style);
  const canvas = manifest.canvas ?? 512;

  await fs.mkdir(outDir, { recursive: true });

  console.log(`风格: ${style}，验收 ${samples} 组 → ${outDir}`);

  for (let i = 0; i < samples; i++) {
    const seed = `validate-${style}-${i + 1}`;
    const buffer = await compositeAvatar(manifest, seed, canvas);
    const outFile = path.join(outDir, `composite-${formatPartId(i + 1)}-${seed}.png`);

    const indices = manifest.layers
      .map((layer) => {
        const idx = seedToSlotIndex(seed, layer.slot, layer.count);
        return `${layer.slot}=${formatPartId(idx)}`;
      })
      .join(', ');

    await fs.writeFile(outFile, buffer);
    console.log(`  ✓ ${path.basename(outFile)} [${indices}]`);
  }

  console.log('完成 — 请人工检查五官对齐与头发衔接');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
