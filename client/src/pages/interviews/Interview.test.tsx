import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Interviews from './index';

// Mock the variants
vi.mock('./variants/AdminInterviews', () => ({
  AdminInterviews: () => (
    <div data-testid='admin-interviews'>Admin Interviews</div>
  ),
}));

vi.mock('./variants/CandidateInterviews', () => ({
  CandidateInterviews: () => (
    <div data-testid='candidate-interviews'>Candidate Interviews</div>
  ),
}));

// Mock the NotAuthorizedPage
vi.mock('../auth/NotAuthorizedPage', () => ({
  NotAuthorizedPage: () => (
    <div data-testid='not-authorized'>Not Authorized</div>
  ),
}));

describe('Interviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NotAuthorizedPage when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interviews />);
    expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
  });

  it('renders AdminInterviews for Admin role', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interviews />);
    expect(screen.getByTestId('admin-interviews')).toBeInTheDocument();
  });

  it('renders AdminInterviews for Interviewer role', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 2,
        email: 'interviewer@example.com',
        fullName: 'Interviewer User',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interviews />);
    expect(screen.getByTestId('admin-interviews')).toBeInTheDocument();
  });

  it('renders CandidateInterviews for Candidate role', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 3,
        email: 'candidate@example.com',
        fullName: 'Candidate User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interviews />);
    expect(screen.getByTestId('candidate-interviews')).toBeInTheDocument();
  });

  it('renders nothing for unknown role', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 4,
        email: 'unknown@example.com',
        fullName: 'Unknown User',
        role: 'UNKNOWN' as UserRole,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<Interviews />);
    expect(container.firstChild).toBeNull();
  });
});
