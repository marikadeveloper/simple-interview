import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

vi.mock('react-router', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

describe('NotFoundPage', () => {
  it('renders 404 title and default subtitle', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders custom message if provided', () => {
    render(<NotFoundPage message='Custom not found message' />);
    expect(screen.getByText('Custom not found message')).toBeInTheDocument();
  });

  it('renders return to dashboard button with correct link', () => {
    render(<NotFoundPage />);
    const button = screen.getByRole('button', { name: /return to dashboard/i });
    expect(button).toBeInTheDocument();
    const link = button.closest('a');
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
