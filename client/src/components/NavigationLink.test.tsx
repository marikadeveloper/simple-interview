import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { NavigationLink } from './NavigationLink';

// Mock react-router NavLink
const mockNavLink = vi.fn();
vi.mock('react-router', () => ({
  NavLink: ({ to, className, children }: any) => {
    mockNavLink({ to, className });
    return (
      <a
        href={to}
        data-testid='nav-link'
        className={className({ isActive: false })}>
        {children}
      </a>
    );
  },
}));

describe('NavigationLink', () => {
  const mockLink = {
    label: 'Dashboard',
    route: '/dashboard',
    icon: () => <div>Icon</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation link with correct props', () => {
    render(<NavigationLink link={mockLink} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link')).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('passes correct props to NavLink', () => {
    render(<NavigationLink link={mockLink} />);

    expect(mockNavLink).toHaveBeenCalledWith({
      to: '/dashboard',
      className: expect.any(Function),
    });
  });

  it('renders with different link data', () => {
    const differentLink = {
      label: 'Interviews',
      route: '/interviews',
      icon: () => <div>Icon</div>,
    };

    render(<NavigationLink link={differentLink} />);

    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link')).toHaveAttribute(
      'href',
      '/interviews',
    );
  });
});
