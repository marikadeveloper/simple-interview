import { createUrqlClient } from '@/utils/createUrqlClient';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UrqlClientProvider } from './UrqlClientContext';

// Mock the createUrqlClient utility
vi.mock('@/utils/createUrqlClient', () => ({
  createUrqlClient: vi.fn(),
}));

// Mock the urql Client and Provider
vi.mock('urql', () => ({
  Client: vi.fn(),
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='urql-provider'>{children}</div>
  ),
}));

describe('UrqlClientContext', () => {
  const mockCreateUrqlClient = vi.mocked(createUrqlClient);
  const mockClient = {
    url: 'http://localhost:3000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: undefined,
    },
    exchanges: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUrqlClient.mockReturnValue(mockClient);
  });

  it('creates a client using createUrqlClient', () => {
    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(mockCreateUrqlClient).toHaveBeenCalledTimes(1);
  });

  it('renders children wrapped in Provider', () => {
    const { getByTestId, getByText } = render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('passes the created client to the Provider', () => {
    const { Client } = require('urql');
    const MockClient = vi.mocked(Client);

    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(MockClient).toHaveBeenCalledWith(mockClient);
  });

  it('creates only one client instance', () => {
    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(mockCreateUrqlClient).toHaveBeenCalledTimes(1);
  });

  it('handles multiple renders without recreating client', () => {
    const { rerender } = render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    rerender(
      <UrqlClientProvider>
        <div>Updated content</div>
      </UrqlClientProvider>,
    );

    // Should still only be called once since the client is created at module level
    expect(mockCreateUrqlClient).toHaveBeenCalledTimes(1);
  });

  it('renders complex nested children correctly', () => {
    const { getByTestId, getByText } = render(
      <UrqlClientProvider>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Click me</button>
        </div>
      </UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Paragraph')).toBeInTheDocument();
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    const { getByTestId } = render(
      <UrqlClientProvider>{null}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });

  it('handles null children', () => {
    const { getByTestId } = render(
      <UrqlClientProvider>{null}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    const { getByTestId } = render(
      <UrqlClientProvider>{undefined}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });
});
