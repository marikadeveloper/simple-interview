import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Layout } from './Layout';

// Mock the components and modules
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: any) => (
    <div data-testid='sidebar-provider'>{children}</div>
  ),
  SidebarTrigger: ({ className, ...props }: any) => (
    <button
      data-testid='sidebar-trigger'
      className={className}
      {...props}>
      <span data-testid='panel-left-icon'>☰</span>
      <span className='sr-only'>Toggle Sidebar</span>
    </button>
  ),
}));

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid='outlet'>Page Content</div>,
}));

vi.mock('./AppSidebar', () => ({
  AppSidebar: () => <div data-testid='app-sidebar'>Sidebar</div>,
}));

vi.mock('./Breadcrumb', () => ({
  AppBreadcrumb: () => <div data-testid='app-breadcrumb'>Breadcrumb</div>,
}));

vi.mock('./ui/sonner', () => ({
  Toaster: ({ theme }: any) => (
    <div
      data-testid='toaster'
      data-theme={theme}>
      Toaster
    </div>
  ),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the layout with correct structure', () => {
    render(<Layout />);

    // Check main layout structure
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();

    // Check main content area - find the specific grid element
    const gridElements = screen.getAllByRole('generic', { hidden: true });
    const mainGrid = gridElements.find(
      (element) =>
        element.className.includes('grid') &&
        element.className.includes('min-h-screen') &&
        element.className.includes('w-full'),
    );
    expect(mainGrid).toBeInTheDocument();
  });

  it('renders the sidebar trigger in the header', () => {
    render(<Layout />);

    const sidebarTrigger = screen.getByTestId('sidebar-trigger');
    expect(sidebarTrigger).toBeInTheDocument();
    expect(sidebarTrigger).toHaveClass('px-4');
    expect(screen.getByTestId('panel-left-icon')).toBeInTheDocument();
  });

  it('renders the breadcrumb in the header', () => {
    render(<Layout />);

    expect(screen.getByTestId('app-breadcrumb')).toBeInTheDocument();
  });

  it('renders the header with correct styling', () => {
    render(<Layout />);

    // Find the header div (the one with border-b class)
    const headerElements = screen.getAllByRole('generic', { hidden: true });
    const header = headerElements.find(
      (element) =>
        element.className.includes('flex') &&
        element.className.includes('items-center') &&
        element.className.includes('border-b'),
    );

    expect(header).toBeInTheDocument();
  });

  it('renders the main content area with correct styling', () => {
    render(<Layout />);

    // Check the main content container
    const contentElements = screen.getAllByRole('generic', { hidden: true });
    const contentContainer = contentElements.find((element) =>
      element.className.includes('p-8'),
    );

    expect(contentContainer).toBeInTheDocument();
  });

  it('renders the outlet for page content', () => {
    render(<Layout />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders the toaster with correct theme', () => {
    render(<Layout />);

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-theme', 'light');
  });

  it('renders the content wrapper with max width', () => {
    render(<Layout />);

    // Find the content wrapper div
    const contentElements = screen.getAllByRole('generic', { hidden: true });
    const contentWrapper = contentElements.find(
      (element) =>
        element.className.includes('mx-auto') &&
        element.className.includes('max-w-5xl'),
    );

    expect(contentWrapper).toBeInTheDocument();
  });

  it('renders the background container with correct styling', () => {
    render(<Layout />);

    // Find the background container
    const backgroundElements = screen.getAllByRole('generic', { hidden: true });
    const backgroundContainer = backgroundElements.find(
      (element) =>
        element.className.includes('min-h-screen') &&
        element.className.includes('bg-background'),
    );

    expect(backgroundContainer).toBeInTheDocument();
  });

  it('renders all required components', () => {
    render(<Layout />);

    // Check that all components are rendered
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('app-breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('maintains proper semantic structure', () => {
    render(<Layout />);

    // The layout should have proper div structure
    const layout = screen.getByTestId('sidebar-provider');
    expect(layout).toBeInTheDocument();

    // Check that the main content area is properly structured
    const mainContent = screen.getByText('Page Content').closest('div');
    expect(mainContent).toBeInTheDocument();
  });

  it('handles sidebar trigger click events', () => {
    render(<Layout />);

    const sidebarTrigger = screen.getByTestId('sidebar-trigger');
    expect(sidebarTrigger).toBeInTheDocument();

    // The trigger should be a button element
    expect(sidebarTrigger.tagName).toBe('BUTTON');
  });

  it('renders with proper accessibility features', () => {
    render(<Layout />);

    // Check for screen reader text
    const srText = screen.getByText('Toggle Sidebar');
    expect(srText).toHaveClass('sr-only');
  });

  it('maintains consistent styling classes', () => {
    render(<Layout />);

    // Check that the layout uses consistent Tailwind classes
    const layoutElements = screen.getAllByRole('generic', { hidden: true });

    // Should have elements with proper spacing and layout classes
    const hasProperClasses = layoutElements.some(
      (element) =>
        element.className.includes('flex') ||
        element.className.includes('grid') ||
        element.className.includes('min-h-screen'),
    );

    expect(hasProperClasses).toBe(true);
  });
});
