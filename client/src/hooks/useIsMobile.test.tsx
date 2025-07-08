import { act, renderHook } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

// Helper to mock window.matchMedia
function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
      listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    },
    dispatch: (event: MediaQueryListEvent) =>
      listeners.forEach((cb) => cb(event)),
  };
}

describe('useIsMobile', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalInnerWidth: number;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      configurable: true,
    });
  });

  it('returns true if window.innerWidth is less than MOBILE_BREAKPOINT', () => {
    const mql = mockMatchMedia(true);
    window.matchMedia = vi.fn().mockImplementation(() => mql as any);
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false if window.innerWidth is greater than or equal to MOBILE_BREAKPOINT', () => {
    const mql = mockMatchMedia(false);
    window.matchMedia = vi.fn().mockImplementation(() => mql as any);
    Object.defineProperty(window, 'innerWidth', {
      value: 900,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates when the matchMedia change event fires', () => {
    let matches = false;
    const mql = mockMatchMedia(matches);
    window.matchMedia = vi.fn().mockImplementation(() => mql as any);
    Object.defineProperty(window, 'innerWidth', {
      value: 900,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      configurable: true,
    });
    act(() => {
      mql.dispatch({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);

    // Simulate resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 900,
      configurable: true,
    });
    act(() => {
      mql.dispatch({ matches: false } as MediaQueryListEvent);
    });
    expect(result.current).toBe(false);
  });
});
