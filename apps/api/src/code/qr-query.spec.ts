import { resolveQrRenderParams, pickQrQuery } from './qr-query';

describe('qr-query', () => {
  it('should pick only known query keys', () => {
    expect(
      pickQrQuery({
        fg: '111111',
        bg: 'eeeeee',
        accent: 'ff0000',
        variant: 'dots',
        radius: '12',
      }),
    ).toEqual({
      fg: '111111',
      bg: 'eeeeee',
      accent: 'ff0000',
      variant: 'dots',
      radius: '12',
    });
  });

  it('should resolve colors variant and radius', () => {
    const params = resolveQrRenderParams({
      fg: '111111',
      bg: 'eeeeee',
      accent: '6366f1',
      variant: 'dots',
      radius: '20',
    });
    expect(params.colors.dark).toBe('#111111');
    expect(params.colors.light).toBe('#eeeeee');
    expect(params.variant).toBe('dots');
    expect(params.radius).toBe(20);
  });

  it('should default matrix variant and zero radius', () => {
    const params = resolveQrRenderParams({});
    expect(params.variant).toBe('matrix');
    expect(params.radius).toBe(0);
  });
});
