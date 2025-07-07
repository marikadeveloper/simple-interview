import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Interview from './index';

// Mock the variant components
const mockCandidateInterview = vi.fn();
const mockReadonlyInterview = vi.fn();

vi.mock('./variants/CandidateInterview', () => ({
  CandidateInterview: () => {
    mockCandidateInterview();
    return <div data-testid='candidate-interview'>Candidate Interview</div>;
  },
}));

vi.mock('./variants/ReadonlyInterview', () => ({
  ReadonlyInterview: () => {
    mockReadonlyInterview();
    return <div data-testid='readonly-interview'>Readonly Interview</div>;
  },
}));

describe('Interview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CandidateInterview for candidate users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'candidate@example.com',
        fullName: 'Test Candidate',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interview />);

    expect(mockCandidateInterview).toHaveBeenCalled();
    expect(screen.getByTestId('candidate-interview')).toBeInTheDocument();
    expect(mockReadonlyInterview).not.toHaveBeenCalled();
  });

  it('renders ReadonlyInterview for admin users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'admin@example.com',
        fullName: 'Test Admin',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interview />);

    expect(mockReadonlyInterview).toHaveBeenCalled();
    expect(screen.getByTestId('readonly-interview')).toBeInTheDocument();
    expect(mockCandidateInterview).not.toHaveBeenCalled();
  });

  it('renders ReadonlyInterview for interviewer users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'interviewer@example.com',
        fullName: 'Test Interviewer',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Interview />);

    expect(mockReadonlyInterview).toHaveBeenCalled();
    expect(screen.getByTestId('readonly-interview')).toBeInTheDocument();
    expect(mockCandidateInterview).not.toHaveBeenCalled();
  });
});
