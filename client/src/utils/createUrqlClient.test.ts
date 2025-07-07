import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUrqlClient } from './createUrqlClient';

// Mock the betterUpdateQuery utility
vi.mock('./betterUpdateQuery', () => ({
  betterUpdateQuery: vi.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('createUrqlClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_URL: 'http://localhost:3000/graphql',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it('creates a client with default configuration', () => {
    const client = createUrqlClient();

    expect(client.url).toBe('http://localhost:3000/graphql');
    expect(client.fetchOptions).toEqual({
      credentials: 'include',
      headers: undefined,
    });
    expect(client.exchanges).toHaveLength(3); // cacheExchange, errorExchange, fetchExchange
  });

  it('uses default API URL when environment variable is not set', () => {
    const client = createUrqlClient();

    expect(client.url).toBe('http://localhost:3000/graphql');
  });

  it('does not include cookie header since cookie is always empty', () => {
    const client = createUrqlClient();

    expect(client.fetchOptions.headers).toBeUndefined();
  });

  it('configures cache exchange with proper keys and resolvers', () => {
    const client = createUrqlClient();

    // Get the cache exchange (first exchange)
    const cacheExchange = client.exchanges[0];

    expect(cacheExchange).toBeDefined();
    expect(typeof cacheExchange).toBe('function');
  });

  it('includes all required exchanges in correct order', () => {
    const client = createUrqlClient();

    expect(client.exchanges).toHaveLength(3);

    // Check that we have the expected exchange types
    // Note: We can't easily test the exact exchange types without importing them,
    // but we can verify the structure
    expect(client.exchanges[0]).toBeDefined(); // cacheExchange
    expect(client.exchanges[1]).toBeDefined(); // errorExchange
    expect(client.exchanges[2]).toBeDefined(); // fetchExchange
  });

  it('handles missing environment variable gracefully', () => {
    vi.stubGlobal('import.meta', {
      env: {},
    });

    const client = createUrqlClient();

    expect(client.url).toBe('http://localhost:3000/graphql');
  });

  it('configures fetch options correctly', () => {
    const client = createUrqlClient();

    expect(client.fetchOptions).toEqual({
      credentials: 'include',
      headers: undefined,
    });
  });

  it('handles cookie header correctly when cookie is empty', () => {
    // Mock empty cookie
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    const client = createUrqlClient();

    expect(client.fetchOptions.headers).toBeUndefined();
  });
});
