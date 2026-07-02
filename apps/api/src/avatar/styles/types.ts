/** 头像风格视觉分组 */
export type AvatarStyleGroup =
  | 'geometric'
  | 'gradient'
  | 'text'
  | 'pixel'
  | 'character'
  | 'icon';

/** 渲染引擎类型 */
export type AvatarEngine = 'native' | 'partner' | 'composite';

/** 风格元数据（供 API 与文档使用） */
export interface AvatarStyleMeta {
  id: string;
  title: string;
  group: AvatarStyleGroup;
  engine: AvatarEngine;
  license: string;
  provider: string;
  attribution?: string;
}
