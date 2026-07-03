import { Injectable } from '@nestjs/common';
import { renderPseudoMatrixSvg } from '../common/pseudo-matrix';
import { parseDimension } from '../common/utils';
import { resolveQrRenderParams, type QrQuery } from './qr-query';

/** 伪 QR 渲染选项 */
export interface QrRenderOptions {
  readonly seed: string;
  readonly width: string | number;
  readonly height?: string | number;
  readonly query?: QrQuery;
}

/**
 * 伪二维码占位 SVG 生成
 */
@Injectable()
export class QrService {
  /**
   * 渲染伪 QR SVG（不可扫描）；支持正方形与矩形输出
   */
  renderSvg(options: QrRenderOptions): string {
    const width = parseDimension(options.width, 'width');
    const height = parseDimension(options.height ?? options.width, 'height');
    const { colors, variant, radius } = options.query
      ? resolveQrRenderParams(options.query)
      : { colors: {}, variant: 'matrix' as const, radius: 0 };
    const hasColors =
      colors.dark !== undefined ||
      colors.light !== undefined ||
      colors.accent !== undefined;

    return renderPseudoMatrixSvg({
      seed: options.seed,
      width,
      height,
      colors: hasColors ? colors : undefined,
      variant,
      radius,
    });
  }
}
