/** 码形占位 variant 元数据 */
export interface CodeStyleVariantMeta {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

/** `GET /code/styles` 响应结构 */
export interface CodeStylesCatalog {
  readonly qr: {
    readonly routes: {
      readonly square: string;
      readonly rect: string;
    };
    readonly variants: readonly CodeStyleVariantMeta[];
    readonly queryParams: readonly string[];
  };
  readonly barcode: {
    readonly routes: {
      readonly default: string;
    };
    readonly variants: readonly CodeStyleVariantMeta[];
    readonly queryParams: readonly string[];
  };
}

/** 码形占位风格目录（API 与 Playground 共用数据源） */
export const CODE_STYLES_CATALOG: CodeStylesCatalog = {
  qr: {
    routes: {
      square: 'GET /qr/:seed/:size',
      rect: 'GET /qr/:seed/:w/:h',
    },
    variants: [
      { id: 'matrix', title: '标准矩阵', description: '定位符 + 时序纹 + 数据区' },
      { id: 'minimal', title: '极简矩阵', description: '无定位符，纯模块阵' },
      { id: 'dots', title: '圆点矩阵', description: '定位符 + 时序纹 + 圆点数据区' },
    ],
    queryParams: ['fg', 'bg', 'accent', 'variant', 'radius'],
  },
  barcode: {
    routes: {
      default: 'GET /barcode/:seed/:w/:h',
    },
    variants: [
      { id: 'code128', title: 'Code128 外形', description: '可变宽条纹' },
      { id: 'ean13', title: 'EAN-13 外形', description: '含 guard 纹，不可扫' },
    ],
    queryParams: ['fg', 'bg', 'variant'],
  },
};

/**
 * 将 variant 元数据格式化为 Playground 下拉标签
 */
export function formatCodeVariantLabel(variant: CodeStyleVariantMeta): string {
  if (variant.id === 'matrix' || variant.id === 'code128') {
    return `${variant.id} · ${variant.title}`;
  }
  return `${variant.id} · ${variant.description.split('，')[0] ?? variant.title}`;
}
