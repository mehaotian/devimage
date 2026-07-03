/** devimg 系列头像 query 参数 */
export interface StyledAvatarQuery {
  variant?: string;
  text?: string;
  shape?: string;
  bg?: string;
  fg?: string;
  pattern?: string;
  format?: string;
}

/**
 * 从 Nest query 对象提取 devimg 头像 query 字段
 */
export function pickStyledAvatarQuery(query: StyledAvatarQuery): StyledAvatarQuery {
  return {
    variant: query.variant,
    text: query.text,
    shape: query.shape,
    bg: query.bg,
    fg: query.fg,
    pattern: query.pattern,
    format: query.format,
  };
}

/**
 * 栅格路由使用的 query（不含 format）
 */
export function pickStyledAvatarRasterQuery(
  query: Omit<StyledAvatarQuery, 'format'>,
): Omit<StyledAvatarQuery, 'format'> {
  return {
    variant: query.variant,
    text: query.text,
    shape: query.shape,
    bg: query.bg,
    fg: query.fg,
    pattern: query.pattern,
  };
}
