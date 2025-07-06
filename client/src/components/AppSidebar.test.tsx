import { UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppSidebar } from './AppSidebar';

// Mock the hooks and modules
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useNavLinks', () => ({
  useNavLinks: vi.fn(),
}));

vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible }: any) => (
    <div
      data-testid='sidebar'
      data-collapsible={collapsible}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: any) => (
    <div data-testid='sidebar-content'>{children}</div>
  ),
  SidebarFooter: ({ children }: any) => (
    <div data-testid='sidebar-footer'>{children}</div>
  ),
  SidebarGroup: ({ children }: any) => (
    <div data-testid='sidebar-group'>{children}</div>
  ),
  SidebarGroupContent: ({ children }: any) => (
    <div data-testid='sidebar-group-content'>{children}</div>
  ),
  SidebarHeader: ({ children }: any) => (
    <div data-testid='sidebar-header'>{children}</div>
  ),
  SidebarMenu: ({ children }: any) => (
    <div data-testid='sidebar-menu'>{children}</div>
  ),
  SidebarMenuButton: ({ children, asChild, isActive, ...props }: any) => (
    <button
      data-testid='sidebar-menu-button'
      data-active={isActive}
      {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: any) => (
    <div data-testid='sidebar-menu-item'>{children}</div>
  ),
  useSidebar: vi.fn(),
}));

vi.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a
      href={to}
      {...props}>
      {children}
    </a>
  ),
}));

vi.mock('./ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid='dropdown-menu'>{children}</div>
  ),
  DropdownMenuContent: ({ children, side, className }: any) => (
    <div
      data-testid='dropdown-menu-content'
      data-side={side}
      className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children }: any) => (
    <div data-testid='dropdown-menu-item'>{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div
      data-testid='dropdown-menu-trigger'
      data-as-child={asChild}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronUp: () => <span data-testid='chevron-up'>↑</span>,
  User2: () => <span data-testid='user-icon'>👤</span>,
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/dashboard',
  },
  writable: true,
});

const mockUseAuth = vi.mocked(await import('@/contexts/AuthContext')).useAuth;
const mockUseNavLinks = vi.mocked(
  await import('@/hooks/useNavLinks'),
).useNavLinks;
const mockUseSidebar = vi.mocked(
  await import('@/components/ui/sidebar'),
).useSidebar;

// Mock icons for nav links
const MockHomeIcon = () => <span data-testid='home-icon'>🏠</span>;
const MockUsersIcon = () => <span data-testid='users-icon'>👥</span>;
const MockTemplatesIcon = () => <span data-testid='templates-icon'>📝</span>;
const MockQuestionBanksIcon = () => (
  <span data-testid='question-banks-icon'>📚</span>
);
const MockInterviewsIcon = () => <span data-testid='interviews-icon'>📋</span>;

const defaultNavLinks = [
  { label: 'Dashboard', route: '/dashboard', icon: MockHomeIcon },
  { label: 'Interviews', route: '/interviews', icon: MockInterviewsIcon },
];

const adminNavLinks = [
  ...defaultNavLinks,
  {
    label: 'Interview Templates',
    route: '/interview-templates',
    icon: MockTemplatesIcon,
  },
  {
    label: 'Question Banks',
    route: '/question-banks',
    icon: MockQuestionBanksIcon,
  },
  { label: 'Users', route: '/users', icon: MockUsersIcon },
];

const mockUser = {
  id: 1,
  email: 'test@example.com',
  fullName: 'Test User',
  role: UserRole.Admin,
  isActive: true,
};

const mockLogout = vi.fn();

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSidebar.mockReturnValue({
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    });
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
    });
    mockUseNavLinks.mockReturnValue(defaultNavLinks);
  });

  it('renders sidebar with correct structure', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
  });

  it('renders header with Simple Interview title when sidebar is open', () => {
    mockUseSidebar.mockReturnValue({
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    });
    render(<AppSidebar />);

    expect(screen.getByText('Simple Interview')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Simple Interview' }),
    ).toHaveAttribute('href', '/dashboard');
  });

  it('renders abbreviated title when sidebar is collapsed', () => {
    mockUseSidebar.mockReturnValue({
      state: 'collapsed',
      open: false,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    });
    render(<AppSidebar />);

    expect(screen.getByText('Si')).toBeInTheDocument();
    expect(screen.queryByText('Simple Interview')).not.toBeInTheDocument();
  });

  it('renders navigation links from useNavLinks hook', () => {
    render(<AppSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('interviews-icon')).toBeInTheDocument();
  });

  it('renders admin-specific navigation links for admin user', () => {
    mockUseNavLinks.mockReturnValue(adminNavLinks);
    render(<AppSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Interview Templates')).toBeInTheDocument();
    expect(screen.getByText('Question Banks')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('marks navigation links as active based on current pathname', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/interviews' },
      writable: true,
    });

    render(<AppSidebar />);

    const menuButtons = screen.getAllByTestId('sidebar-menu-button');
    const interviewsButton = menuButtons.find((button) =>
      button.textContent?.includes('Interviews'),
    );

    expect(interviewsButton).toHaveAttribute('data-active', 'true');
  });

  it('renders user dropdown in footer', () => {
    render(<AppSidebar />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
  });

  it('renders "User" when user has no fullName', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, fullName: '' },
      logout: mockLogout,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
    });

    render(<AppSidebar />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders dropdown menu content with profile and logout options', () => {
    render(<AppSidebar />);

    // The dropdown content should be present but might be hidden by default
    // We're testing the structure, not the visibility
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-content')).toHaveAttribute(
      'data-side',
      'top',
    );
  });

  it('calls logout function when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<AppSidebar />);

    // Find and click the logout button
    const logoutButton = screen.getByRole('button', { name: 'Sign out' });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders profile link in dropdown', () => {
    render(<AppSidebar />);

    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('handles empty nav links gracefully', () => {
    mockUseNavLinks.mockReturnValue([]);
    render(<AppSidebar />);

    // Should still render the structure even with no nav links
    // Check that there are no navigation menu buttons (only the user dropdown should remain)
    const menuButtons = screen.getAllByTestId('sidebar-menu-button');
    expect(menuButtons).toHaveLength(1); // Only the user dropdown button
  });

  it('handles null user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
    });

    render(<AppSidebar />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders sidebar with collapsible icon prop', () => {
    render(<AppSidebar />);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsible', 'icon');
  });
});
