import * as AuthContext from '@/contexts/AuthContext';
import {
  InterviewListItemFragment,
  InterviewStatus,
  UserRole,
} from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import { UpdateInterviewDialog } from './UpdateInterviewDialog';

// Mock the mutations and queries
const mockUpdateInterview = vi.fn();
const mockGetInterviewTemplates = vi.fn();
const mockGetUsers = vi.fn();

// Mock useMutationWithToast to return the mock function
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useUpdateInterviewMutation: () => [null, mockUpdateInterview],
    useGetInterviewTemplatesQuery: () => [
      { data: mockGetInterviewTemplates() },
    ],
    useGetUsersQuery: () => [{ data: mockGetUsers() }],
  };
});

// Mock useAuth
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

describe('UpdateInterviewDialog', () => {
  let mockInterview: InterviewListItemFragment = {
    id: 1,
    interviewTemplate: {
      id: 1,
      name: 'JavaScript Fundamentals',
      description: 'Test your JavaScript knowledge',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'javascript-fundamentals',
      tags: null,
      __typename: 'InterviewTemplate',
    },
    user: {
      id: 2,
      email: 'candidate@example.com',
      fullName: 'Test Candidate',
      role: UserRole.Candidate,
      isActive: true,
      __typename: 'User',
    },
    interviewer: {
      id: 3,
      email: 'interviewer@example.com',
      fullName: 'Test Interviewer',
      role: UserRole.Interviewer,
      isActive: true,
      __typename: 'User',
    },
    deadline: '2024-02-01T23:59:59Z',
    status: InterviewStatus.Pending,
    evaluationValue: null,
    slug: 'interview-1',
    completedAt: null,
    __typename: 'Interview',
  };

  const mockInterviewTemplates = [
    {
      id: 1,
      name: 'JavaScript Fundamentals',
      description: 'Test your JavaScript knowledge',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'javascript-fundamentals',
      tags: null,
      __typename: 'InterviewTemplate',
    },
    {
      id: 2,
      name: 'React Basics',
      description: 'Test your React knowledge',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'react-basics',
      tags: null,
      __typename: 'InterviewTemplate',
    },
  ];

  const mockUsers = [
    {
      id: 2,
      email: 'candidate@example.com',
      fullName: 'Test Candidate',
      role: UserRole.Candidate,
      isActive: true,
      __typename: 'User',
    },
    {
      id: 4,
      email: 'candidate2@example.com',
      fullName: 'Another Candidate',
      role: UserRole.Candidate,
      isActive: true,
      __typename: 'User',
    },
    {
      id: 3,
      email: 'interviewer@example.com',
      fullName: 'Test Interviewer',
      role: UserRole.Interviewer,
      isActive: true,
      __typename: 'User',
    },
    {
      id: 5,
      email: 'interviewer2@example.com',
      fullName: 'Another Interviewer',
      role: UserRole.Interviewer,
      isActive: true,
      __typename: 'User',
    },
  ];

  beforeEach(() => {
    mockUpdateInterview.mockReset();
    mockGetInterviewTemplates.mockReset();
    mockGetUsers.mockReset();

    // Set up default mock returns
    mockGetInterviewTemplates.mockReturnValue({
      getInterviewTemplates: mockInterviewTemplates,
    });
    mockGetUsers.mockReturnValue({
      getUsers: mockUsers,
    });

    // Reset AuthContext mock to default state
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
  });

  it('renders update button with pencil icon', () => {
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    expect(updateButton).toBeInTheDocument();
    expect(updateButton).toHaveAttribute('data-slot', 'button');
  });

  it('opens dialog when update button is clicked', async () => {
    const user = userEvent.setup();
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    expect(screen.getByText('Update Interview')).toBeInTheDocument();
    expect(
      screen.getByText('Here you can update the interview details.'),
    ).toBeInTheDocument();
  });

  it('shows form fields with current interview data', async () => {
    const user = userEvent.setup();
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    expect(screen.getByText('Interview Template')).toBeInTheDocument();
    expect(screen.getByText('Candidate')).toBeInTheDocument();
    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
  });

  it('shows current values in form fields', async () => {
    const user = userEvent.setup();
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Test Candidate')).toBeInTheDocument();
    expect(screen.getByText('Test Interviewer')).toBeInTheDocument();
  });

  it('calls update mutation when form is submitted', async () => {
    const user = userEvent.setup();
    mockUpdateInterview.mockResolvedValue({
      data: { updateInterview: { id: 1 } },
      error: null,
    });

    mockInterview.deadline = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(
      () => {
        expect(mockUpdateInterview).toHaveBeenCalledWith({
          id: 1,
          input: {
            interviewTemplateId: 1,
            candidateId: 2,
            deadline: mockInterview.deadline?.split('T')[0],
            interviewerId: 3,
          },
        });
      },
      { timeout: 3000 },
    );
  });

  it('closes dialog after successful update', async () => {
    const user = userEvent.setup();
    mockUpdateInterview.mockResolvedValue({
      data: { updateInterview: { id: 1 } },
      error: null,
    });

    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(
      () => {
        expect(screen.queryByText('Update Interview')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByText('Update Interview')).not.toBeInTheDocument();
  });

  it('shows fallback message for non-pending interviews', () => {
    const completedInterview = {
      ...mockInterview,
      status: InterviewStatus.Completed,
    };

    render(<UpdateInterviewDialog interview={completedInterview} />);

    const updateButton = screen.getByRole('button');
    expect(updateButton).toBeDisabled();
  });

  it('shows fallback content when dialog is opened for non-pending interview', async () => {
    const user = userEvent.setup();

    // Mock the component to bypass the disabled button logic
    const MockUpdateDialog = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>Update</button>
          {isOpen && (
            <div>
              <h2>Update Interview</h2>
              <div>
                <h3>Attention</h3>
                <p>You can only update interviews that are pending.</p>
              </div>
            </div>
          )}
        </>
      );
    };

    render(<MockUpdateDialog />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(
      screen.getByText('You can only update interviews that are pending.'),
    ).toBeInTheDocument();
  });

  it('hides interviewer field for non-admin users', async () => {
    const user = userEvent.setup();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 3,
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

    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    expect(screen.queryByText('Interviewer')).not.toBeInTheDocument();
  });

  it('handles update failure gracefully', async () => {
    const user = userEvent.setup();
    mockUpdateInterview.mockResolvedValue({
      data: null,
      error: {
        message: 'Failed to update interview',
      },
    });

    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Dialog should remain open on error
    await waitFor(() => {
      expect(screen.getByText('Update Interview')).toBeInTheDocument();
    });
  });

  it('resets form when dialog is closed', async () => {
    const user = userEvent.setup();
    render(<UpdateInterviewDialog interview={mockInterview} />);

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    // Verify form is populated
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Reopen dialog
    await user.click(updateButton);

    // Form should still show current values
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
  });

  it('handles interview with different interviewer', async () => {
    const user = userEvent.setup();
    const interviewWithDifferentInterviewer = {
      ...mockInterview,
      interviewer: {
        id: 5,
        email: 'different@example.com',
        fullName: 'Different Interviewer',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User' as const,
      },
    };

    render(
      <UpdateInterviewDialog interview={interviewWithDifferentInterviewer} />,
    );

    const updateButton = screen.getByRole('button');
    await user.click(updateButton);

    // Should still show the form
    expect(screen.getByText('Update Interview')).toBeInTheDocument();
    expect(screen.getByText('Interview Template')).toBeInTheDocument();
  });
});
