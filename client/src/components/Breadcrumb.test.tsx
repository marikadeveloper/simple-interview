import { render, screen } from '@testing-library/react';
import * as reactRouter from 'react-router';
import { AppBreadcrumb } from './Breadcrumb';

// Mock Link to render children
vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  Link: ({ to, children }: any) => (
    <a
      href={to}
      data-testid='breadcrumb-link'>
      {children}
    </a>
  ),
  useLocation: vi.fn(),
}));

const mockedUseLocation = reactRouter.useLocation as any;

describe('AppBreadcrumb', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Home as the first breadcrumb', () => {
    mockedUseLocation.mockReturnValue({ pathname: '/' });
    render(<AppBreadcrumb />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders breadcrumbs for a single path segment', () => {
    mockedUseLocation.mockReturnValue({ pathname: '/users' });
    render(<AppBreadcrumb />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders breadcrumbs for multiple path segments', () => {
    mockedUseLocation.mockReturnValue({ pathname: '/users/profile' });
    render(<AppBreadcrumb />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders correct links for intermediate breadcrumbs', () => {
    mockedUseLocation.mockReturnValue({ pathname: '/users/profile/settings' });
    render(<AppBreadcrumb />);
    // Home should link to '/'
    expect(screen.getAllByTestId('breadcrumb-link')[0]).toHaveAttribute(
      'href',
      '/',
    );
    // Users should link to '/users'
    expect(screen.getAllByTestId('breadcrumb-link')[1]).toHaveAttribute(
      'href',
      '/users',
    );
    // Profile should link to '/users/profile'
    expect(screen.getAllByTestId('breadcrumb-link')[2]).toHaveAttribute(
      'href',
      '/users/profile',
    );
    // Settings is the last, so not a link
    expect(screen.getByText('Settings').closest('a')).toBeNull();
  });

  it('handles dash-separated path segments', () => {
    mockedUseLocation.mockReturnValue({
      pathname: '/question-bank/interview-template',
    });
    render(<AppBreadcrumb />);
    expect(screen.getByText('Question Bank')).toBeInTheDocument();
    expect(screen.getByText('Interview Template')).toBeInTheDocument();
  });
});
