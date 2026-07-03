import { Injectable } from '@nestjs/common';
import { renderPseudoBarcodeSvg } from '../common/pseudo-barcode';
import { parseDimension } from '../common/utils';
import { resolveBarcodeRenderParams, type BarcodeQuery } from './barcode-query';

/** 伪条码渲染选项 */
export interface BarcodeRenderOptions {
  readonly seed: string;
  readonly width: string | number;
  readonly height: string | number;
  readonly query?: BarcodeQuery;
}

/**
 * 伪一维条形码占位 SVG 生成
 */
@Injectable()
export class BarcodeService {
  /**
   * 渲染矩形伪条码 SVG（不可扫描）
   */
  renderSvg(options: BarcodeRenderOptions): string {
    const width = parseDimension(options.width, 'width');
    const height = parseDimension(options.height, 'height');
    const { variant, colors } = options.query
      ? resolveBarcodeRenderParams(options.query)
      : { variant: 'code128' as const, colors: {} };
    const hasColors = colors.dark !== undefined || colors.light !== undefined;

    return renderPseudoBarcodeSvg({
      seed: options.seed,
      width,
      height,
      variant,
      colors: hasColors ? colors : undefined,
    });
  }
}
