import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { NotAuthorizedPage } from './NotAuthorizedPage';

vi.mock('react-router', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

describe('NotAuthorizedPage', () => {
  it('renders 403 title and subtitle', () => {
    render(<NotAuthorizedPage />);
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(
      screen.getByText('You are not authorized to view this page.'),
    ).toBeInTheDocument();
  });

  it('renders return to home button with correct link', () => {
    render(<NotAuthorizedPage />);
    const button = screen.getByRole('button', { name: /return to home/i });
    expect(button).toBeInTheDocument();
    const link = button.closest('a');
    expect(link).toHaveAttribute('href', '/');
  });
});
