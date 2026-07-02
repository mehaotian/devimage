#!/usr/bin/env node
/**
 * 将可灵生成的 Sprite Sheet 按网格裁剪为 512×512 PNG 部件
 *
 * @example
 * node scripts/split-sprite-sheet.mjs \
 *   --input assets/devimage-cn/raw/faces-8x8.png \
 *   --slot faces --cols 8 --rows 8
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { formatPartId, parseArgs } from './lib/seed.mjs';

const CANVAS = 512;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 裁剪单格并缩放到目标画布
 * @param {import('sharp').Sharp} image - sharp 实例
 * @param {object} rect - 裁剪区域
 * @param {number} rect.left - 左偏移
 * @param {number} rect.top - 上偏移
 * @param {number} rect.width - 格宽
 * @param {number} rect.height - 格高
 * @param {string} outFile - 输出路径
 */
async function extractCell(image, rect, outFile) {
  await image
    .clone()
    .extract(rect)
    .resize(CANVAS, CANVAS, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(outFile);
}

/**
 * 主流程：读取大图 → 网格裁剪 → 写入 slot 目录
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputRel = args.input;
  const slot = args.slot;
  const cols = Number(args.cols ?? 8);
  const rows = Number(args.rows ?? cols);

  if (!inputRel || typeof inputRel !== 'string') {
    console.error('缺少 --input，例如 assets/devimage-cn/raw/faces-8x8.png');
    process.exit(1);
  }
  if (!slot || typeof slot !== 'string') {
    console.error('缺少 --slot，例如 faces | features | hair');
    process.exit(1);
  }

  const inputPath = path.resolve(ROOT, inputRel);
  const outDir = path.resolve(ROOT, args.out ?? `assets/devimage-cn/${slot}`);

  await fs.mkdir(outDir, { recursive: true });

  const meta = await sharp(inputPath).metadata();
  const sheetWidth = meta.width ?? 0;
  const sheetHeight = meta.height ?? 0;

  if (sheetWidth === 0 || sheetHeight === 0) {
    console.error(`无法读取图片尺寸: ${inputPath}`);
    process.exit(1);
  }

  const cellWidth = Math.floor(sheetWidth / cols);
  const cellHeight = Math.floor(sheetHeight / rows);
  const image = sharp(inputPath);
  const total = cols * rows;

  console.log(`输入: ${inputPath} (${sheetWidth}×${sheetHeight})`);
  console.log(`网格: ${cols}×${rows}，单格 ${cellWidth}×${cellHeight} → ${CANVAS}×${CANVAS}`);
  console.log(`输出: ${outDir}`);

  let index = 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const outFile = path.join(outDir, `${formatPartId(index)}.png`);
      await extractCell(
        image,
        {
          left: col * cellWidth,
          top: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
        },
        outFile,
      );
      index++;
    }
  }

  console.log(`完成: ${total} 张 → ${outDir}`);
  console.log(`请更新 manifest/devimage-cn.json 中 layers[slot=${slot}].count = ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
