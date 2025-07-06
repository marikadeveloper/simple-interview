import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreateInterviewDialog } from './CreateInterviewDialog';

// Mock the mutations and queries
const mockCreateInterview = vi.fn();
const mockGetInterviewTemplatesQuery = vi.fn();
const mockGetUsersQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useCreateInterviewMutation: () => [null, mockCreateInterview],
    useGetInterviewTemplatesQuery: () => [
      { data: mockGetInterviewTemplatesQuery() },
    ],
    useGetUsersQuery: () => [{ data: mockGetUsersQuery() }],
    UserRole: actual.UserRole,
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => {
      const mutation = _mutation();
      return mutation[1](args);
    },
  ],
}));

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

function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('CreateInterviewDialog', () => {
  const mockInterviewTemplates = [
    {
      id: 1,
      name: 'Frontend Interview',
      description: 'Frontend development interview',
      __typename: 'InterviewTemplate',
    },
    {
      id: 2,
      name: 'Backend Interview',
      description: 'Backend development interview',
      __typename: 'InterviewTemplate',
    },
  ];

  const mockUsers = [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'CANDIDATE',
      __typename: 'User',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      role: 'CANDIDATE',
      __typename: 'User',
    },
    {
      id: 3,
      fullName: 'Bob Interviewer',
      email: 'bob@example.com',
      role: 'INTERVIEWER',
      __typename: 'User',
    },
    {
      id: 4,
      fullName: 'Alice Interviewer',
      email: 'alice@example.com',
      role: 'INTERVIEWER',
      __typename: 'User',
    },
  ];

  beforeEach(() => {
    mockCreateInterview.mockReset();
    mockGetInterviewTemplatesQuery.mockReset();
    mockGetUsersQuery.mockReset();

    // Default mock returns
    mockGetInterviewTemplatesQuery.mockReturnValue({
      getInterviewTemplates: mockInterviewTemplates,
    });
    mockGetUsersQuery.mockReturnValue({
      getUsers: mockUsers,
    });
  });

  it('renders the dialog button', () => {
    render(<CreateInterviewDialog />);
    expect(
      screen.getByRole('button', { name: /add interview/i }),
    ).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    expect(screen.getByText('Create Interview')).toBeInTheDocument();
    expect(
      screen.getByText('Create a new interview for a candidate.'),
    ).toBeInTheDocument();
  });

  it('shows all form fields when dialog is open', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    expect(screen.getByText('Interview Template')).toBeInTheDocument();
    expect(screen.getByText('Candidate')).toBeInTheDocument();
    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
  });

  it('shows interviewer field for Admin role', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    // The interviewer field should be a combobox for Admin role
    expect(
      screen.getByRole('combobox', { name: /interviewer/i }),
    ).toBeInTheDocument();
  });

  it('hides interviewer field for Interviewer role', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 3,
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

    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    expect(
      screen.getByText('You are automatically assigned as the interviewer.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: /interviewer/i }),
    ).not.toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    // mock admin role
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
    mockCreateInterview.mockResolvedValue({ error: null });
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Select interview template
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    // Select candidate
    await user.click(screen.getByRole('combobox', { name: /candidate/i }));
    await user.click(screen.getByText('John Doe'));

    // Select interviewer
    await user.click(screen.getByRole('combobox', { name: /interviewer/i }));
    await user.click(screen.getByText('Bob Interviewer'));

    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateInterview).toHaveBeenCalledWith({
        input: {
          interviewTemplateId: 1,
          candidateId: 1,
          deadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          interviewerId: 3,
        },
      });
    });
  });

  it('shows validation error for missing interview template', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Interview template is required.'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for missing candidate', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Select interview template but not candidate
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Candidate is required.')).toBeInTheDocument();
    });
  });

  it('shows validation error for missing interviewer (Admin role)', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Select interview template and candidate but not interviewer
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    await user.click(screen.getByRole('combobox', { name: /candidate/i }));
    await user.click(screen.getByText('John Doe'));

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Interviewer is required.')).toBeInTheDocument();
    });
  });

  it('closes dialog on successful submission', async () => {
    mockCreateInterview.mockResolvedValue({ error: null });
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Fill form
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    await user.click(screen.getByRole('combobox', { name: /candidate/i }));
    await user.click(screen.getByText('John Doe'));

    await user.click(screen.getByRole('combobox', { name: /interviewer/i }));
    await user.click(screen.getByText('Bob Interviewer'));

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.queryByText('Create Interview')).not.toBeInTheDocument();
    });
  });

  it('does not close dialog on submission error', async () => {
    const { user } = setup(<CreateInterviewDialog />);
    mockCreateInterview.mockResolvedValue({
      error: 'Failed to create interview',
    });

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Fill form
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    await user.click(screen.getByRole('combobox', { name: /candidate/i }));
    await user.click(screen.getByText('John Doe'));

    await user.click(screen.getByRole('combobox', { name: /interviewer/i }));
    await user.click(screen.getByText('Bob Interviewer'));

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Create Interview')).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByText('Create Interview')).not.toBeInTheDocument();
  });

  it('resets form when dialog is closed', async () => {
    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Fill form
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );
    await user.click(screen.getByText('Frontend Interview'));

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Reopen dialog
    await user.click(screen.getByRole('button', { name: /add interview/i }));

    // Check that form is reset
    expect(
      screen.getByRole('combobox', { name: /interview template/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /candidate/i }),
    ).toBeInTheDocument();
  });

  it('handles empty interview templates data', async () => {
    mockGetInterviewTemplatesQuery.mockReturnValue({
      getInterviewTemplates: [],
    });

    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));
    await user.click(
      screen.getByRole('combobox', { name: /interview template/i }),
    );

    expect(screen.getByText('No templates found.')).toBeInTheDocument();
  });

  it('handles empty users data', async () => {
    mockGetUsersQuery.mockReturnValue({
      getUsers: [],
    });

    const { user } = setup(<CreateInterviewDialog />);

    await user.click(screen.getByRole('button', { name: /add interview/i }));
    await user.click(screen.getByRole('combobox', { name: /candidate/i }));

    expect(screen.getByText('No candidates found.')).toBeInTheDocument();
  });
});
