import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the context providers
const mockAuthProvider = vi.fn();
const mockUrqlClientProvider = vi.fn();

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => {
    mockAuthProvider(children);
    return <div data-testid='auth-provider'>{children}</div>;
  },
}));

vi.mock('./contexts/UrqlClientContext', () => ({
  UrqlClientProvider: ({ children }: { children: React.ReactNode }) => {
    mockUrqlClientProvider(children);
    return <div data-testid='urql-client-provider'>{children}</div>;
  },
}));

// Mock AppRoutes component
const mockAppRoutes = vi.fn();
vi.mock('./AppRoutes', () => ({
  AppRoutes: () => {
    mockAppRoutes();
    return <div data-testid='app-routes'>App Routes</div>;
  },
}));

// Mock react-router BrowserRouter
const mockBrowserRouter = vi.fn();
vi.mock('react-router', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => {
    mockBrowserRouter(children);
    return <div data-testid='browser-router'>{children}</div>;
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main application structure', () => {
    render(<App />);

    // Check that all main components are rendered
    expect(screen.getByTestId('urql-client-provider')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });

  it('sets up providers in correct order', () => {
    render(<App />);

    // Verify that providers are called
    expect(mockUrqlClientProvider).toHaveBeenCalled();
    expect(mockBrowserRouter).toHaveBeenCalled();
    expect(mockAuthProvider).toHaveBeenCalled();
  });

  it('renders AppRoutes component', () => {
    render(<App />);

    expect(mockAppRoutes).toHaveBeenCalled();
    expect(screen.getByText('App Routes')).toBeInTheDocument();
  });

  it('maintains provider hierarchy', () => {
    render(<App />);

    // Check that the hierarchy is correct: UrqlClientProvider > BrowserRouter > AuthProvider > AppRoutes
    const urqlProvider = screen.getByTestId('urql-client-provider');
    const browserRouter = screen.getByTestId('browser-router');
    const authProvider = screen.getByTestId('auth-provider');
    const appRoutes = screen.getByTestId('app-routes');

    // Verify the DOM hierarchy
    expect(urqlProvider).toContainElement(browserRouter);
    expect(browserRouter).toContainElement(authProvider);
    expect(authProvider).toContainElement(appRoutes);
  });

  it('provides all necessary context providers', () => {
    render(<App />);

    // Verify that all required providers are present
    expect(screen.getByTestId('urql-client-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('sets up routing with BrowserRouter', () => {
    render(<App />);

    expect(mockBrowserRouter).toHaveBeenCalled();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  });
});
