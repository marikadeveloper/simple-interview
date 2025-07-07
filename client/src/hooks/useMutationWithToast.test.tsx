import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutationWithToast } from './useMutationWithToast';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockToast = vi.mocked(toast);

describe('useMutationWithToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute mutation successfully and show success toast', async () => {
    const mockExecuteMutation = vi.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null,
    });

    const mockMutationHook = vi
      .fn()
      .mockReturnValue([
        { data: null, error: null, fetching: false },
        mockExecuteMutation,
      ]);

    const { result } = renderHook(() =>
      useMutationWithToast(mockMutationHook, {
        successMessage: 'Operation completed successfully',
        errorMessage: 'An error occurred',
      }),
    );

    const [mutationResult, executeWithToast] = result.current;

    await act(async () => {
      const response = await executeWithToast({ input: 'test' });
      expect(response.data).toEqual({ result: 'success' });
      expect(response.error).toBeNull();
    });

    expect(mockExecuteMutation).toHaveBeenCalledWith({ input: 'test' });
    expect(mockToast.success).toHaveBeenCalledWith(
      'Operation completed successfully',
    );
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('should handle GraphQL errors and show error toast', async () => {
    const graphqlError = new Error('GraphQL error');
    const mockExecuteMutation = vi.fn().mockResolvedValue({
      data: null,
      error: graphqlError,
    });

    const mockMutationHook = vi
      .fn()
      .mockReturnValue([
        { data: null, error: null, fetching: false },
        mockExecuteMutation,
      ]);

    const { result } = renderHook(() =>
      useMutationWithToast(mockMutationHook, {
        successMessage: 'Operation completed successfully',
        errorMessage: 'An error occurred',
      }),
    );

    const [mutationResult, executeWithToast] = result.current;

    await act(async () => {
      const response = await executeWithToast({ input: 'test' });
      expect(response.data).toBeNull();
      expect(response.error).toBe(graphqlError);
    });

    expect(mockExecuteMutation).toHaveBeenCalledWith({ input: 'test' });
    expect(mockToast.error).toHaveBeenCalledWith('An error occurred', {
      description: 'GraphQL error',
    });
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle thrown errors and show error toast', async () => {
    const thrownError = new Error('Network error');
    const mockExecuteMutation = vi.fn().mockRejectedValue(thrownError);

    const mockMutationHook = vi
      .fn()
      .mockReturnValue([
        { data: null, error: null, fetching: false },
        mockExecuteMutation,
      ]);

    const { result } = renderHook(() =>
      useMutationWithToast(mockMutationHook, {
        successMessage: 'Operation completed successfully',
        errorMessage: 'An error occurred',
      }),
    );

    const [mutationResult, executeWithToast] = result.current;

    await act(async () => {
      await expect(executeWithToast({ input: 'test' })).rejects.toThrow(
        'Network error',
      );
    });

    expect(mockExecuteMutation).toHaveBeenCalledWith({ input: 'test' });
    expect(mockToast.error).toHaveBeenCalledWith('An error occurred', {
      description: 'Network error',
    });
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle non-Error thrown values', async () => {
    const mockExecuteMutation = vi.fn().mockRejectedValue('String error');

    const mockMutationHook = vi
      .fn()
      .mockReturnValue([
        { data: null, error: null, fetching: false },
        mockExecuteMutation,
      ]);

    const { result } = renderHook(() =>
      useMutationWithToast(mockMutationHook, {
        successMessage: 'Operation completed successfully',
        errorMessage: 'An error occurred',
      }),
    );

    const [mutationResult, executeWithToast] = result.current;

    await act(async () => {
      await expect(executeWithToast({ input: 'test' })).rejects.toBe(
        'String error',
      );
    });

    expect(mockExecuteMutation).toHaveBeenCalledWith({ input: 'test' });
    expect(mockToast.error).toHaveBeenCalledWith('An error occurred', {
      description: 'Unknown error occurred',
    });
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should use default messages when not provided', async () => {
    const mockExecuteMutation = vi.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null,
    });

    const mockMutationHook = vi
      .fn()
      .mockReturnValue([
        { data: null, error: null, fetching: false },
        mockExecuteMutation,
      ]);

    const { result } = renderHook(() => useMutationWithToast(mockMutationHook));

    const [mutationResult, executeWithToast] = result.current;

    await act(async () => {
      await executeWithToast({ input: 'test' });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      'Operation completed successfully',
    );
  });

  it('should return the original mutation result', async () => {
    const mockExecuteMutation = vi.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null,
      fetching: false,
    });

    const originalResult = {
      data: { result: 'success' },
      error: null,
      fetching: false,
    };
    const mockMutationHook = vi
      .fn()
      .mockReturnValue([originalResult, mockExecuteMutation]);

    const { result } = renderHook(() =>
      useMutationWithToast(mockMutationHook, {
        successMessage: 'Custom success message',
        errorMessage: 'Custom error message',
      }),
    );

    const [mutationResult, executeWithToast] = result.current;

    // Check that the original mutation result is returned
    expect(mutationResult).toEqual(originalResult);

    await act(async () => {
      await executeWithToast({ input: 'test' });
    });

    expect(mockToast.success).toHaveBeenCalledWith('Custom success message');
  });
});
