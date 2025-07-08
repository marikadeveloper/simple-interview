import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import FirstPasswordChangePage from './FirstPasswordChangePage';

const mockChangePassword = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useChangePasswordMutation: () => [null, mockChangePassword],
  };
});

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('FirstPasswordChangePage', () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the change password form', () => {
    render(<FirstPasswordChangePage />);
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields and password match', async () => {
    render(<FirstPasswordChangePage />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(
      await screen.findAllByText(/must contain at least/i),
    ).not.toHaveLength(0);

    // Fill only new password, not confirm
    await userEvent.type(screen.getByLabelText('Old Password'), 'oldpassword');
    await userEvent.type(
      screen.getByLabelText('New Password'),
      'newpassword!!',
    );
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      'newpassword',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/must match/i)).toBeInTheDocument();
  });

  it('submits form and calls changePassword mutation', async () => {
    mockChangePassword.mockResolvedValue({
      data: { changePassword: { id: 1 } },
    });
    render(<FirstPasswordChangePage />);
    await userEvent.type(screen.getByLabelText('Old Password'), 'oldpassword');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpassword');
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      'newpassword',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        input: {
          oldPassword: 'oldpassword',
          newPassword: 'newpassword',
        },
      });
    });
  });

  it('navigates to dashboard on successful password change', async () => {
    mockChangePassword.mockResolvedValue({
      data: { changePassword: { id: 1 } },
    });
    render(<FirstPasswordChangePage />);
    await userEvent.type(screen.getByLabelText('Old Password'), 'oldpassword');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpassword');
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      'newpassword',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error if mutation throws', async () => {
    mockChangePassword.mockRejectedValue(new Error('fail'));
    render(<FirstPasswordChangePage />);
    await userEvent.type(screen.getByLabelText('Old Password'), 'oldpassword');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpassword');
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      'newpassword',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });
});
