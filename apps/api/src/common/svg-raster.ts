import sharp from 'sharp';

export type SvgRasterFormat = 'png' | 'webp';

/**
 * 将 SVG 字符串栅格化为 PNG 或 WebP
 */
export async function rasterizeSvg(svg: string, format: SvgRasterFormat): Promise<Buffer> {
  const pipeline = sharp(Buffer.from(svg, 'utf-8'));

  if (format === 'png') {
    return pipeline.png({ compressionLevel: 9 }).toBuffer();
  }

  return pipeline.webp({ quality: 80 }).toBuffer();
}
