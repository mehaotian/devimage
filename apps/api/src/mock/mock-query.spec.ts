import { parseMockPagination, sliceMockPool } from './mock-query';

describe('parseMockPagination', () => {
  it('should return null when no pagination params', () => {
    expect(parseMockPagination(undefined, undefined)).toBeNull();
  });

  it('should parse page and limit', () => {
    expect(parseMockPagination('2', '5')).toEqual({ page: 2, limit: 5 });
  });

  it('should default page to 1 when only limit provided', () => {
    expect(parseMockPagination(undefined, '10')).toEqual({ page: 1, limit: 10 });
  });
});

describe('sliceMockPool', () => {
  it('should slice pool by page', () => {
    const items = sliceMockPool((id) => id, 2, 3);
    expect(items).toEqual([4, 5, 6]);
  });

  it('should return empty array when page exceeds pool', () => {
    expect(sliceMockPool((id) => id, 50, 10)).toEqual([]);
  });
});
