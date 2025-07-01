import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combines multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', undefined, 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-lg', 'text-sm')).toBe('text-sm');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles null and undefined', () => {
    expect(cn(null, undefined, '')).toBe('');
  });
});
