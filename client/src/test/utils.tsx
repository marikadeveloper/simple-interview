import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router';
import {
  cacheExchange,
  createClient,
  Exchange,
  fetchExchange,
  Operation,
  OperationResult,
  Provider,
} from 'urql';
import { filter, fromValue, merge, mergeMap, pipe } from 'wonka';
import { AuthProvider } from '../contexts/AuthContext';

// Custom mock exchange for the Me query
const mockMeExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    const handled$ = pipe(
      ops$,
      filter(
        (operation: Operation) =>
          operation.kind === 'query' &&
          operation.query.definitions.some(
            (def) =>
              def.kind === 'OperationDefinition' && def.name?.value === 'Me',
          ),
      ),
      mergeMap((operation: Operation) => {
        const result: OperationResult = {
          operation,
          data: {
            me: {
              id: '1',
              email: 'test@example.com',
              fullName: 'Test User',
              role: 'ADMIN',
              isActive: true,
              __typename: 'User',
            },
          },
          stale: false,
          hasNext: false,
        };
        return fromValue(result);
      }),
    );
    const passthrough$ = pipe(
      ops$,
      filter(
        (operation: Operation) =>
          !(
            operation.kind === 'query' &&
            operation.query.definitions.some(
              (def) =>
                def.kind === 'OperationDefinition' && def.name?.value === 'Me',
            )
          ),
      ),
      forward,
    );
    return merge([handled$, passthrough$]);
  };

const createTestClient = () => {
  return createClient({
    url: 'http://localhost:4000/graphql',
    exchanges: [cacheExchange, mockMeExchange, fetchExchange],
  });
};

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const client = createTestClient();

  return (
    <Provider value={client}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
