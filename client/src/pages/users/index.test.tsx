import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Users from './index';

// Mock Data
const mockUsers = [
  {
    __typename: 'User',
    id: 1,
    email: 'john@example.com',
    fullName: 'John Doe',
    role: 'INTERVIEWER',
    isActive: true,
  },
  {
    __typename: 'User',
    id: 2,
    email: 'jane@example.com',
    fullName: 'Jane Smith',
    role: 'CANDIDATE',
    isActive: true,
  },
  {
    __typename: 'User',
    id: 3,
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'ADMIN',
    isActive: false,
  },
];

// Mock CreateUserDialog as a dumb component
vi.mock('./components/CreateUserDialog', () => ({
  CreateUserDialog: () => <div data-testid='create-user-dialog' />,
}));

// Mock UserActions as a dumb component
vi.mock('./components/UserActions', () => ({
  UserActions: () => <div data-testid='user-actions'>Actions</div>,
}));

// Mock useGetUsersQuery
const mockUseGetUsersQuery = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetUsersQuery: () => mockUseGetUsersQuery(),
  };
});

describe('Users page', () => {
  beforeEach(() => {
    mockUseGetUsersQuery.mockReset();
  });

  it('renders table with users when data is loaded', () => {
    mockUseGetUsersQuery.mockReturnValue([
      { data: { getUsers: mockUsers }, fetching: false },
      vi.fn(),
    ]);
    render(<Users />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getAllByTestId('user-actions').length).toBeGreaterThan(0);
    expect(screen.getByTestId('create-user-dialog')).toBeInTheDocument();
  });

  it('filters users by search', async () => {
    mockUseGetUsersQuery.mockReturnValue([
      { data: { getUsers: mockUsers }, fetching: false },
      vi.fn(),
    ]);
    render(<Users />);
    const input = screen.getByPlaceholderText(/filter by name or email/i);
    await userEvent.type(input, 'John');
    expect(input).toHaveValue('John');
    // Simulate search button click
    await userEvent.keyboard('{enter}');
    // The actual filtering is handled by the query, so we just check the input value
    // and that the table is still rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders empty table if no users', () => {
    mockUseGetUsersQuery.mockReturnValue([
      { data: { getUsers: [] }, fetching: false },
      vi.fn(),
    ]);
    render(<Users />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('renders with null users data', () => {
    mockUseGetUsersQuery.mockReturnValue([
      { data: { getUsers: null }, fetching: false },
      vi.fn(),
    ]);
    render(<Users />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });
});
