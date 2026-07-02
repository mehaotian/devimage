/** 头像风格视觉分组 */
export type AvatarStyleGroup =
  | 'geometric'
  | 'gradient'
  | 'text'
  | 'pixel'
  | 'character'
  | 'icon'
  | 'abstract'
  | 'retro'
  | 'symbol'
  | 'filter';

/** 渲染引擎类型 */
export type AvatarEngine = 'native' | 'partner' | 'composite';

/** 可选 Query 参数（Playground 与文档用） */
export type AvatarStyleQueryParam = 'variant' | 'text' | 'shape' | 'bg' | 'fg' | 'pattern';

/** 风格元数据（供 API 与文档使用） */
export interface AvatarStyleMeta {
  id: string;
  title: string;
  group: AvatarStyleGroup;
  engine: AvatarEngine;
  license: string;
  provider: string;
  attribution?: string;
  /** 映射到 canonical style（兼容别名） */
  aliasOf?: string;
  /** 该风格支持的 URL query 参数 */
  queryParams?: readonly AvatarStyleQueryParam[];
  /** 实验性风格（预览阶段，未写入正式 API 文档） */
  experimental?: boolean;
}
