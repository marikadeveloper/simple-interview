import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call the function after the specified delay', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should only call the function once for multiple rapid calls', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should call the function with the correct arguments', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should preserve the context (this)', () => {
    const context = { value: 42 };
    let capturedContext: any;

    const func = function (this: any) {
      capturedContext = this;
    };

    const debouncedFunc = debounce(func, 100);
    debouncedFunc.call(context);

    vi.advanceTimersByTime(100);
    expect(capturedContext).toBe(context);
  });

  it('should cancel the pending execution', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc.cancel();

    vi.advanceTimersByTime(100);
    expect(func).not.toHaveBeenCalled();
  });

  it('should allow new calls after cancellation', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc.cancel();

    debouncedFunc();
    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should handle zero delay', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 0);

    debouncedFunc();
    vi.advanceTimersByTime(0);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple rapid calls with different arguments', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('first');
    debouncedFunc('second');
    debouncedFunc('third');

    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('third');
  });

  it('should work with async functions', async () => {
    const asyncFunc = vi.fn().mockResolvedValue('result');
    const debouncedFunc = debounce(asyncFunc, 100);

    debouncedFunc();
    vi.advanceTimersByTime(100);

    // Wait for the async function to complete
    await vi.runAllTimersAsync();
    expect(asyncFunc).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple cancellations', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc.cancel();
    debouncedFunc.cancel(); // Should not cause issues

    vi.advanceTimersByTime(100);
    expect(func).not.toHaveBeenCalled();
  });
});
