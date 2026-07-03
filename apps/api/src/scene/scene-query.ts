import { BadRequestException } from '@nestjs/common';
import { parseHexColor } from '../common/utils';

export type SceneTheme = 'light' | 'dark';

/** scene query 参数 */
export interface SceneQuery {
  w?: string;
  h?: string;
  theme?: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  seed?: string;
}

/** 解析后的 scene 文案与配色 */
export interface SceneRenderOptions {
  theme: SceneTheme;
  title?: string;
  subtitle?: string;
  accent?: string;
  seed?: string;
}

/**
 * 解析 scene theme（light | dark）
 */
export function parseSceneTheme(value?: string): SceneTheme {
  if (!value || value === '' || value === 'light') {
    return 'light';
  }
  if (value === 'dark') {
    return 'dark';
  }
  throw new BadRequestException('Invalid theme: use light or dark');
}

/**
 * 解析可选 accent hex
 */
export function parseSceneAccent(value?: string): string | undefined {
  if (!value || value === '') {
    return undefined;
  }
  try {
    return parseHexColor(value, '6366f1');
  } catch {
    throw new BadRequestException(`Invalid accent color: ${value}`);
  }
}

/**
 * 解析 scene 文案 query（title/subtitle 最长 50）
 */
export function resolveSceneQuery(query: SceneQuery): SceneRenderOptions {
  return {
    theme: parseSceneTheme(query.theme),
    title: query.title?.trim() || undefined,
    subtitle: query.subtitle?.trim() || undefined,
    accent: parseSceneAccent(query.accent),
    seed: query.seed?.trim() || undefined,
  };
}
