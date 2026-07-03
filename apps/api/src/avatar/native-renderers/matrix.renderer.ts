import { renderPseudoMatrixSvg } from '../../common/pseudo-matrix';
import { type NativeRendererInput } from './helpers';

/**
 * 渲染类 QR 模块矩阵头像（不可扫描，仅视觉）
 */
export function renderMatrix(input: NativeRendererInput): string {
  return renderPseudoMatrixSvg({ seed: input.seed, width: input.size, height: input.size });
}
