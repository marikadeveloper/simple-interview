import { describe, expect, it } from 'vitest';
import { useAuth } from '../../contexts/AuthContext';
import { render, screen, waitFor } from '../utils';

// Test component to access auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid='is-authenticated'>{isAuthenticated.toString()}</div>
      <div data-testid='user-email'>{user?.email || 'No user'}</div>
      <div data-testid='user-role'>{user?.role || 'No role'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide authentication state', async () => {
    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });
  });
});
