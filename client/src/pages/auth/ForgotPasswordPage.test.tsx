import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ForgotPasswordPage from './ForgotPasswordPage';

// Mock useForgotPasswordRequestMutation
const mockForgotPasswordRequest = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useForgotPasswordRequestMutation: () => [null, mockForgotPasswordRequest],
  };
});

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    mockForgotPasswordRequest.mockReset();
  });

  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submits the form and shows success message', async () => {
    mockForgotPasswordRequest.mockResolvedValue({
      data: { forgotPasswordRequest: true },
    });
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/password reset link has been sent/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on unexpected error', async () => {
    mockForgotPasswordRequest.mockRejectedValue(new Error('Network error'));
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, {
      target: { value: 'not-an-email' },
    });
    fireEvent.blur(emailInput);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Wait for the custom error message to appear
    await screen.findByText(/please enter a valid email address/i);
  });
});
