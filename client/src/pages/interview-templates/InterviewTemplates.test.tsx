import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import InterviewTemplates from './index';

// Mock Data
const mockTemplates = [
  {
    __typename: 'InterviewTemplate',
    id: 1,
    name: 'Frontend Template',
    description: 'A template for frontend interviews',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    slug: 'frontend-template',
    tags: [
      { __typename: 'Tag', id: 1, text: 'React' },
      { __typename: 'Tag', id: 2, text: 'UI' },
    ],
  },
  {
    __typename: 'InterviewTemplate',
    id: 2,
    name: 'Backend Template',
    description: 'A template for backend interviews',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    slug: 'backend-template',
    tags: [{ __typename: 'Tag', id: 3, text: 'Node.js' }],
  },
];
const mockTags = [
  { __typename: 'Tag', id: 1, text: 'React' },
  { __typename: 'Tag', id: 2, text: 'UI' },
  { __typename: 'Tag', id: 3, text: 'Node.js' },
];

// Mock CreateTemplateDialog as a dumb component
vi.mock('./components/CreateTemplateDialog', () => ({
  CreateTemplateDialog: (props: any) => (
    <div
      data-testid='create-template-dialog'
      {...props}
    />
  ),
}));

// Mock InterviewTemplateActions as a dumb component
vi.mock('./components/InterviewTemplateActions', () => ({
  InterviewTemplateActions: () => (
    <div data-testid='template-actions'>Actions</div>
  ),
}));

// Mock useGetInterviewTemplatesQuery and useGetTagsQuery
const mockUseGetInterviewTemplatesQuery = vi.fn();
const mockUseGetTagsQuery = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewTemplatesQuery: () => mockUseGetInterviewTemplatesQuery(),
    useGetTagsQuery: () => mockUseGetTagsQuery(),
  };
});

describe('InterviewTemplates page', () => {
  beforeEach(() => {
    mockUseGetInterviewTemplatesQuery.mockReset();
    mockUseGetTagsQuery.mockReset();
  });

  it('renders table with templates when data is loaded', () => {
    mockUseGetInterviewTemplatesQuery.mockReturnValue([
      { data: { getInterviewTemplates: mockTemplates }, fetching: false },
    ]);
    mockUseGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);
    render(<InterviewTemplates />);
    expect(screen.getByText('Interview Templates')).toBeInTheDocument();
    expect(screen.getByText('Frontend Template')).toBeInTheDocument();
    expect(screen.getByText('Backend Template')).toBeInTheDocument();
    expect(screen.getAllByTestId('template-actions').length).toBeGreaterThan(0);
    expect(screen.getByTestId('create-template-dialog')).toBeInTheDocument();
  });

  it('filters templates by search', async () => {
    mockUseGetInterviewTemplatesQuery.mockReturnValue([
      { data: { getInterviewTemplates: mockTemplates }, fetching: false },
    ]);
    mockUseGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);
    render(<InterviewTemplates />);
    const input = screen.getByPlaceholderText(/filter by name or tag/i);
    await userEvent.type(input, 'Backend');
    expect(input).toHaveValue('Backend');
    // Simulate search button click
    await userEvent.keyboard('{enter}');
    // The actual filtering is handled by the query, so we just check the input value
    // and that the table is still rendered
    expect(screen.getByText('Backend Template')).toBeInTheDocument();
  });

  it('renders empty table if no templates', () => {
    mockUseGetInterviewTemplatesQuery.mockReturnValue([
      { data: { getInterviewTemplates: [] }, fetching: false },
    ]);
    mockUseGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);
    render(<InterviewTemplates />);
    expect(screen.getByText('Interview Templates')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Template')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Template')).not.toBeInTheDocument();
  });

  it('renders with no tags', () => {
    mockUseGetInterviewTemplatesQuery.mockReturnValue([
      { data: { getInterviewTemplates: mockTemplates }, fetching: false },
    ]);
    mockUseGetTagsQuery.mockReturnValue([{ data: { getTags: [] } }]);
    render(<InterviewTemplates />);
    expect(screen.getByTestId('create-template-dialog')).toBeInTheDocument();
  });
});
