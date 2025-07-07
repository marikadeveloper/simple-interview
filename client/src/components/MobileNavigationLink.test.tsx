import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MobileNavigationLink } from './MobileNavigationLink';

// Mock react-router NavLink
const mockNavLink = vi.fn();
vi.mock('react-router', () => ({
  NavLink: ({ to, onClick, className, children }: any) => {
    mockNavLink({ to, onClick, className });
    return (
      <a
        href={to}
        onClick={onClick}
        data-testid='nav-link'
        className={className({ isActive: false })}>
        {children}
      </a>
    );
  },
}));

describe('MobileNavigationLink', () => {
  const mockOnLinkClick = vi.fn();
  const mockLink = {
    label: 'Dashboard',
    route: '/dashboard',
    icon: () => <div>Icon</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation link with correct props', () => {
    render(
      <MobileNavigationLink
        onLinkClick={mockOnLinkClick}
        link={mockLink}
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link')).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('calls onLinkClick when link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MobileNavigationLink
        onLinkClick={mockOnLinkClick}
        link={mockLink}
      />,
    );

    await user.click(screen.getByTestId('nav-link'));

    expect(mockOnLinkClick).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to NavLink', () => {
    render(
      <MobileNavigationLink
        onLinkClick={mockOnLinkClick}
        link={mockLink}
      />,
    );

    expect(mockNavLink).toHaveBeenCalledWith({
      to: '/dashboard',
      onClick: mockOnLinkClick,
      className: expect.any(Function),
    });
  });

  it('renders with different link data', () => {
    const differentLink = {
      label: 'Interviews',
      route: '/interviews',
      icon: () => <div>Icon</div>,
    };

    render(
      <MobileNavigationLink
        onLinkClick={mockOnLinkClick}
        link={differentLink}
      />,
    );

    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link')).toHaveAttribute(
      'href',
      '/interviews',
    );
  });

  it('handles click event properly', async () => {
    const user = userEvent.setup();
    const customOnClick = vi.fn();

    render(
      <MobileNavigationLink
        onLinkClick={customOnClick}
        link={mockLink}
      />,
    );

    await user.click(screen.getByTestId('nav-link'));

    expect(customOnClick).toHaveBeenCalledTimes(1);
  });
});
