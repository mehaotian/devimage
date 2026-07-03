import { BadRequestException } from '@nestjs/common';
import { parseSceneTheme, resolveSceneQuery } from './scene-query';

describe('parseSceneTheme', () => {
  it('should default to light', () => {
    expect(parseSceneTheme(undefined)).toBe('light');
  });

  it('should parse dark', () => {
    expect(parseSceneTheme('dark')).toBe('dark');
  });

  it('should reject invalid theme', () => {
    expect(() => parseSceneTheme('blue')).toThrow(BadRequestException);
  });
});

describe('resolveSceneQuery', () => {
  it('should merge title and seed', () => {
    expect(
      resolveSceneQuery({
        theme: 'dark',
        title: '自定义',
        seed: 'demo',
      }),
    ).toEqual({
      theme: 'dark',
      title: '自定义',
      subtitle: undefined,
      accent: undefined,
      seed: 'demo',
    });
  });
});
