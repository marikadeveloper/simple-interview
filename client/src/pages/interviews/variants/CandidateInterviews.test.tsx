import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CandidateInterviews } from './CandidateInterviews';

// Mock GraphQL query
const mockGetInterviewsQuery = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewsQuery: () => [{ data: mockGetInterviewsQuery() }],
  };
});

// Mock UI components
vi.mock('@/components/ui/page-title', () => ({
  PageTitle: (props: any) => <h1>{props.children}</h1>,
}));
vi.mock('@/components/ui/page-subtitle', () => ({
  PageSubtitle: (props: any) => <h2>{props.children}</h2>,
}));
vi.mock('../components/InterviewCard', () => ({
  InterviewCard: ({ interview }: any) => (
    <div data-testid='interview-card'>{interview.id}</div>
  ),
}));

describe('CandidateInterviews', () => {
  beforeEach(() => {
    mockGetInterviewsQuery.mockReset();
  });

  it('renders title and subtitle', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateInterviews />);
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(
      screen.getByText('Here you can see and take your interviews.'),
    ).toBeInTheDocument();
  });

  it('renders no InterviewCard when no interviews', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateInterviews />);
    expect(screen.queryByTestId('interview-card')).not.toBeInTheDocument();
  });

  it('renders InterviewCard for each interview', () => {
    mockGetInterviewsQuery.mockReturnValue({
      getInterviews: [
        { id: 1, __typename: 'Interview' },
        { id: 2, __typename: 'Interview' },
      ],
    });
    render(<CandidateInterviews />);
    const cards = screen.getAllByTestId('interview-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('1');
    expect(cards[1]).toHaveTextContent('2');
  });
});
