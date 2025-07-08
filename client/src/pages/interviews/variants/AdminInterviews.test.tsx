import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AdminInterviews } from './AdminInterviews';

// Mock GraphQL query
const mockGetInterviewsQuery = vi.fn();
let mockFetching = false;
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewsQuery: () => [
      { data: mockGetInterviewsQuery(), fetching: mockFetching },
      vi.fn(),
    ],
  };
});

// Mock UI components
vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({ data }: any) => (
    <div data-testid='data-table'>{data.length} rows</div>
  ),
}));
vi.mock('@/components/ui/page-title', () => ({
  PageTitle: (props: any) => <h1>{props.children}</h1>,
}));
vi.mock('@/components/ui/page-subtitle', () => ({
  PageSubtitle: (props: any) => <h2>{props.children}</h2>,
}));
vi.mock('@/components/ui/search-bar', () => ({
  __esModule: true,
  default: ({ value, onChange, onSearch }: any) => (
    <div>
      <input
        data-testid='search-input'
        value={value}
        onChange={onChange}
      />
      <button
        data-testid='search-btn'
        onClick={onSearch}>
        Search
      </button>
    </div>
  ),
}));
vi.mock('@/components/ui/skeleton', () => ({
  TableSkeleton: () => <div data-testid='table-skeleton'>Loading...</div>,
}));
vi.mock('../components/CreateInterviewDialog', () => ({
  CreateInterviewDialog: () => (
    <button data-testid='create-dialog'>Create</button>
  ),
}));

// columns is just passed through, no need to mock

describe('AdminInterviews', () => {
  beforeEach(() => {
    mockGetInterviewsQuery.mockReset();
    mockFetching = false;
  });

  it('renders loading skeleton when fetching', () => {
    mockFetching = true;
    mockGetInterviewsQuery.mockReturnValue(undefined);
    render(<AdminInterviews />);
    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
  });

  it('renders empty table when no interviews', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<AdminInterviews />);
    expect(screen.getByTestId('data-table')).toHaveTextContent('0 rows');
  });

  it('renders table with interviews', () => {
    mockGetInterviewsQuery.mockReturnValue({
      getInterviews: [
        { id: 1, __typename: 'Interview' },
        { id: 2, __typename: 'Interview' },
      ],
    });
    render(<AdminInterviews />);
    expect(screen.getByTestId('data-table')).toHaveTextContent('2 rows');
  });

  it('renders title, subtitle, and create dialog', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<AdminInterviews />);
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(
      screen.getByText('Here you can manage interviews.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
  });

  it('search bar updates input and triggers search', async () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<AdminInterviews />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;
    const btn = screen.getByTestId('search-btn');
    await userEvent.type(input, 'test');
    expect(input.value).toBe('test');
    fireEvent.click(btn); // triggers handleSearch
    // No assertion for reexecuteQuery, but input and button are wired
  });
});
