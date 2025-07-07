import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryParam } from '../../hooks/useQueryParam';

// Mock useSearchParams from react-router
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual, {
    useSearchParams: vi.fn(),
  });
});

import * as router from 'react-router';

describe('useQueryParam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the value of a single query param', () => {
    vi.mocked(router.useSearchParams).mockReturnValue([
      {
        get: (key: string) => (key === 'foo' ? 'bar' : null),
        getAll: (key: string) => [],
      } as any,
      vi.fn(),
    ]);
    const { result } = renderHook(() => useQueryParam('foo'));
    expect(result.current).toBe('bar');
  });

  it('should return null if the param is missing', () => {
    vi.mocked(router.useSearchParams).mockReturnValue([
      {
        get: () => null,
        getAll: () => [],
      } as any,
      vi.fn(),
    ]);
    const { result } = renderHook(() => useQueryParam('missing'));
    expect(result.current).toBeNull();
  });

  it('should return all values for a param when multiple=true', () => {
    vi.mocked(router.useSearchParams).mockReturnValue([
      {
        get: () => null,
        getAll: (key: string) => (key === 'foo' ? ['a', 'b', 'c'] : []),
      } as any,
      vi.fn(),
    ]);
    const { result } = renderHook(() => useQueryParam('foo', true));
    expect(result.current).toEqual(['a', 'b', 'c']);
  });

  it('should return an empty array for missing param with multiple=true', () => {
    vi.mocked(router.useSearchParams).mockReturnValue([
      {
        get: () => null,
        getAll: () => [],
      } as any,
      vi.fn(),
    ]);
    const { result } = renderHook(() => useQueryParam('missing', true));
    expect(result.current).toEqual([]);
  });
});
