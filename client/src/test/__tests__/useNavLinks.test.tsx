import { renderHook } from '@testing-library/react';
import {
  Database,
  FileUser,
  Home,
  NotepadTextDashed,
  Users,
} from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { UserFragment, UserRole } from '../../generated/graphql';
import { useNavLinks } from '../../hooks/useNavLinks';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(
  await import('../../contexts/AuthContext'),
).useAuth;

describe('useNavLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return dashboard and interviews for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useNavLinks());

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual({
      label: 'Dashboard',
      route: '/dashboard',
      icon: Home,
    });
    expect(result.current[1]).toEqual({
      label: 'Interviews',
      route: '/interviews',
      icon: FileUser,
    });
  });

  it('should return dashboard and interviews for candidates', () => {
    const mockUser: UserFragment = {
      id: 1,
      email: 'candidate@example.com',
      role: UserRole.Candidate,
      fullName: 'Test Candidate',
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useNavLinks());

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual({
      label: 'Dashboard',
      route: '/dashboard',
      icon: Home,
    });
    expect(result.current[1]).toEqual({
      label: 'Interviews',
      route: '/interviews',
      icon: FileUser,
    });
  });

  it('should return all navigation links for interviewers', () => {
    const mockUser: UserFragment = {
      id: 1,
      email: 'interviewer@example.com',
      role: UserRole.Interviewer,
      fullName: 'Test Interviewer',
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useNavLinks());

    expect(result.current).toHaveLength(5);
    expect(result.current[0]).toEqual({
      label: 'Dashboard',
      route: '/dashboard',
      icon: Home,
    });
    expect(result.current[1]).toEqual({
      label: 'Interviews',
      route: '/interviews',
      icon: FileUser,
    });
    expect(result.current[2]).toEqual({
      label: 'Interview Templates',
      route: '/interview-templates',
      icon: NotepadTextDashed,
    });
    expect(result.current[3]).toEqual({
      label: 'Question Banks',
      route: '/question-banks',
      icon: Database,
    });
    expect(result.current[4]).toEqual({
      label: 'Users',
      route: '/users',
      icon: Users,
    });
  });

  it('should return all navigation links for admins', () => {
    const mockUser: UserFragment = {
      id: 1,
      email: 'admin@example.com',
      role: UserRole.Admin,
      fullName: 'Test Admin',
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useNavLinks());

    expect(result.current).toHaveLength(5);
    expect(result.current[0]).toEqual({
      label: 'Dashboard',
      route: '/dashboard',
      icon: Home,
    });
    expect(result.current[1]).toEqual({
      label: 'Interviews',
      route: '/interviews',
      icon: FileUser,
    });
    expect(result.current[2]).toEqual({
      label: 'Interview Templates',
      route: '/interview-templates',
      icon: NotepadTextDashed,
    });
    expect(result.current[3]).toEqual({
      label: 'Question Banks',
      route: '/question-banks',
      icon: Database,
    });
    expect(result.current[4]).toEqual({
      label: 'Users',
      route: '/users',
      icon: Users,
    });
  });

  it('should memoize the result and only recalculate when user changes', () => {
    const mockUser: UserFragment = {
      id: 1,
      email: 'admin@example.com',
      role: UserRole.Admin,
      fullName: 'Test Admin',
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result, rerender } = renderHook(() => useNavLinks());
    const firstResult = result.current;

    // Rerender without changing user
    rerender();
    expect(result.current).toBe(firstResult); // Should be the same reference

    // Change user
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, role: UserRole.Candidate },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    rerender();
    expect(result.current).not.toBe(firstResult); // Should be a new reference
    expect(result.current).toHaveLength(2); // Should have fewer links for candidate
  });

  it('should handle undefined user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useNavLinks());

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toEqual({
      label: 'Dashboard',
      route: '/dashboard',
      icon: Home,
    });
    expect(result.current[1]).toEqual({
      label: 'Interviews',
      route: '/interviews',
      icon: FileUser,
    });
  });
});
