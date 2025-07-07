import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    // Reset module cache to ensure fresh imports
    vi.resetModules();
  });

  it('creates a client using createUrqlClient', async () => {
    // Import the module after setting up mocks
    const { createUrqlClient } = await import('@/utils/createUrqlClient');
    const mockCreateUrqlClient = vi.mocked(createUrqlClient);
    mockCreateUrqlClient.mockReturnValue(mockClient);

    // Import the component which will trigger the module-level initialization
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(mockCreateUrqlClient).toHaveBeenCalledTimes(1);
  });

  it('renders children wrapped in Provider', async () => {
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    const { getByTestId, getByText } = render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('passes the created client to the Provider', async () => {
    const { createUrqlClient } = await import('@/utils/createUrqlClient');
    const mockCreateUrqlClient = vi.mocked(createUrqlClient);
    mockCreateUrqlClient.mockReturnValue(mockClient);

    const { Client } = await import('urql');
    const MockClient = vi.mocked(Client);

    // Import the component which will trigger the module-level initialization
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    expect(MockClient).toHaveBeenCalledWith(mockClient);
  });

  it('creates only one client instance', async () => {
    const { createUrqlClient } = await import('@/utils/createUrqlClient');
    const mockCreateUrqlClient = vi.mocked(createUrqlClient);
    mockCreateUrqlClient.mockReturnValue(mockClient);

    // Import the component which will trigger the module-level initialization
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    render(
      <UrqlClientProvider>
        <div>Test content</div>
      </UrqlClientProvider>,
    );

    // The client is created once at module import time
    expect(mockCreateUrqlClient).toHaveBeenCalledTimes(1);
  });

  it('handles multiple renders without recreating client', async () => {
    const { createUrqlClient } = await import('@/utils/createUrqlClient');
    const mockCreateUrqlClient = vi.mocked(createUrqlClient);
    mockCreateUrqlClient.mockReturnValue(mockClient);

    // Import the component which will trigger the module-level initialization
    const { UrqlClientProvider } = await import('./UrqlClientContext');

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

  it('renders complex nested children correctly', async () => {
    const { UrqlClientProvider } = await import('./UrqlClientContext');

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

  it('handles empty children', async () => {
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    const { getByTestId } = render(
      <UrqlClientProvider>{null}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });

  it('handles null children', async () => {
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    const { getByTestId } = render(
      <UrqlClientProvider>{null}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });

  it('handles undefined children', async () => {
    const { UrqlClientProvider } = await import('./UrqlClientContext');

    const { getByTestId } = render(
      <UrqlClientProvider>{undefined}</UrqlClientProvider>,
    );

    expect(getByTestId('urql-provider')).toBeInTheDocument();
  });
});
