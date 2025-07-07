import { UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { PublicRoute } from './PublicRoute';

// Mock the useAuth hook but keep AuthProvider
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock the Navigate component
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    Navigate: vi.fn(),
  };
});

const mockUseAuth = vi.mocked(await import('@/contexts/AuthContext')).useAuth;

describe('PublicRoute', () => {
  const TestContent = () => <div>Public Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <PublicRoute>
        <TestContent />
      </PublicRoute>,
    );

    // Should show skeleton instead of content
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    // The skeleton component should be rendered
    expect(
      document.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument();
  });

  it('should show content when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <PublicRoute>
        <TestContent />
      </PublicRoute>,
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user is authenticated and is active', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PublicRoute>
          <TestContent />
        </PublicRoute>
      </MemoryRouter>,
    );

    // Should not show public content
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    expect(Navigate).toHaveBeenCalledWith(
      { to: '/dashboard', replace: true },
      undefined,
    );
  });
});
