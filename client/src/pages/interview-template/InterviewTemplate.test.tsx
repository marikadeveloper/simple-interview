import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import InterviewTemplate from './index';

// Mock the queries
const mockGetInterviewTemplateBySlugQuery = vi.fn();
const mockGetTagsQuery = vi.fn();

// Mock useGetInterviewTemplateBySlugQuery and useGetTagsQuery
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewTemplateBySlugQuery: () =>
      mockGetInterviewTemplateBySlugQuery(),
    useGetTagsQuery: () => mockGetTagsQuery(),
  };
});

// Mock react-router
const mockUseParams = vi.fn();
vi.mock('react-router', () => ({
  useParams: () => mockUseParams(),
}));

// Mock the child components
vi.mock('./components/FormHeading', () => ({
  FormHeading: ({ interviewTemplate, tags, setFormVisible }: any) => (
    <div data-testid='form-heading'>
      <h2>Edit Template</h2>
      <p>Template: {interviewTemplate.name}</p>
      <p>Tags: {tags.length}</p>
      <button
        onClick={() => setFormVisible(false)}
        data-testid='cancel-edit-btn'>
        Cancel
      </button>
    </div>
  ),
}));

vi.mock('./components/ReadonlyHeading', () => ({
  ReadonlyHeading: ({ interviewTemplate, setFormVisible }: any) => (
    <div data-testid='readonly-heading'>
      <h1>{interviewTemplate.name}</h1>
      <p>{interviewTemplate.description}</p>
      <button
        onClick={() => setFormVisible(true)}
        data-testid='edit-btn'>
        Edit
      </button>
    </div>
  ),
}));

vi.mock('./components/QuestionBankSelector', () => ({
  QuestionBankSelector: ({ templateId }: any) => (
    <div data-testid='question-bank-selector'>
      <p>Question Bank Selector for template {templateId}</p>
    </div>
  ),
}));

vi.mock('../../components/QuestionCard', () => ({
  QuestionCard: ({ templateId }: any) => (
    <div data-testid='question-card'>
      <p>Question Card for template {templateId}</p>
    </div>
  ),
}));

vi.mock('../../components/QuestionList', () => ({
  QuestionList: ({ questions }: any) => (
    <div data-testid='question-list'>
      <p>Question List with {questions?.length || 0} questions</p>
      {questions?.map((q: any) => (
        <div
          key={q.id}
          data-testid={`question-${q.id}`}>
          {q.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../auth/NotFoundPage', () => ({
  NotFoundPage: ({ message }: any) => (
    <div data-testid='not-found-page'>
      <h1>Not Found</h1>
      <p>{message}</p>
    </div>
  ),
}));

describe('InterviewTemplate', () => {
  const mockInterviewTemplate = {
    id: 1,
    name: 'Test Interview Template',
    description: 'This is a test interview template',
    slug: 'test-interview-template',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    questions: [
      {
        id: 1,
        title: 'Question 1',
        description: 'First question description',
        updatedAt: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        questionBank: {
          id: 1,
          name: 'Test Bank',
          slug: 'test-bank',
          __typename: 'QuestionBank',
        },
        __typename: 'Question',
      },
      {
        id: 2,
        title: 'Question 2',
        description: 'Second question description',
        updatedAt: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        questionBank: {
          id: 1,
          name: 'Test Bank',
          slug: 'test-bank',
          __typename: 'QuestionBank',
        },
        __typename: 'Question',
      },
    ],
    tags: [
      {
        id: 1,
        text: 'JavaScript',
        __typename: 'Tag',
      },
      {
        id: 2,
        text: 'React',
        __typename: 'Tag',
      },
    ],
    __typename: 'InterviewTemplate',
  };

  const mockTags = [
    { id: 1, text: 'JavaScript', __typename: 'Tag' },
    { id: 2, text: 'React', __typename: 'Tag' },
    { id: 3, text: 'TypeScript', __typename: 'Tag' },
  ];

  beforeEach(() => {
    mockGetInterviewTemplateBySlugQuery.mockReset();
    mockGetTagsQuery.mockReset();
    mockUseParams.mockReset();
  });

  it('renders loading skeleton when fetching', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      { data: null, fetching: true },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: null }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('detailpageskeleton')).toBeInTheDocument();
  });

  it('renders not found page when template does not exist', () => {
    mockUseParams.mockReturnValue({ slug: 'non-existent' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      { data: { getInterviewTemplateBySlug: null }, fetching: false },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: null }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(
      screen.getByText('Interview template not found'),
    ).toBeInTheDocument();
  });

  it('renders readonly heading by default', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.getByText('Test Interview Template')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test interview template'),
    ).toBeInTheDocument();
  });

  it('renders question bank selector and question card', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('question-bank-selector')).toBeInTheDocument();
    expect(
      screen.getByText('Question Bank Selector for template 1'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(
      screen.getByText('Question Card for template 1'),
    ).toBeInTheDocument();
  });

  it('renders question list with questions', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('question-list')).toBeInTheDocument();
    expect(
      screen.getByText('Question List with 2 questions'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('question-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-2')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('switches to form heading when edit button is clicked', async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    // Initially shows readonly heading
    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.queryByTestId('form-heading')).not.toBeInTheDocument();

    // Click edit button
    await user.click(screen.getByTestId('edit-btn'));

    // Should now show form heading
    expect(screen.getByTestId('form-heading')).toBeInTheDocument();
    expect(screen.queryByTestId('readonly-heading')).not.toBeInTheDocument();
  });

  it('switches back to readonly heading when cancel is clicked', async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    // Click edit button to show form
    await user.click(screen.getByTestId('edit-btn'));
    expect(screen.getByTestId('form-heading')).toBeInTheDocument();

    // Click cancel button
    await user.click(screen.getByTestId('cancel-edit-btn'));

    // Should switch back to readonly heading
    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.queryByTestId('form-heading')).not.toBeInTheDocument();
  });

  it('handles empty questions array', () => {
    const templateWithoutQuestions = {
      ...mockInterviewTemplate,
      questions: [],
    };

    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: templateWithoutQuestions },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('question-list')).toBeInTheDocument();
    expect(
      screen.getByText('Question List with 0 questions'),
    ).toBeInTheDocument();
  });

  it('handles null questions', () => {
    const templateWithNullQuestions = {
      ...mockInterviewTemplate,
      questions: null,
    };

    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: templateWithNullQuestions },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: mockTags } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('question-list')).toBeInTheDocument();
    expect(
      screen.getByText('Question List with 0 questions'),
    ).toBeInTheDocument();
  });

  it('handles empty tags array', () => {
    const templateWithoutTags = {
      ...mockInterviewTemplate,
      tags: [],
    };

    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: templateWithoutTags },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: [] } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.getByTestId('question-bank-selector')).toBeInTheDocument();
  });

  it('handles null tags', () => {
    const templateWithNullTags = {
      ...mockInterviewTemplate,
      tags: null,
    };

    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: templateWithNullTags },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: [] } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.getByTestId('question-bank-selector')).toBeInTheDocument();
  });

  it('handles null tags data from query', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: null }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.getByTestId('question-bank-selector')).toBeInTheDocument();
  });

  it('handles null getTags from query', () => {
    mockUseParams.mockReturnValue({ slug: 'test-template' });
    mockGetInterviewTemplateBySlugQuery.mockReturnValue([
      {
        data: { getInterviewTemplateBySlug: mockInterviewTemplate },
        fetching: false,
      },
    ]);
    mockGetTagsQuery.mockReturnValue([{ data: { getTags: null } }]);

    render(<InterviewTemplate />);

    expect(screen.getByTestId('readonly-heading')).toBeInTheDocument();
    expect(screen.getByTestId('question-bank-selector')).toBeInTheDocument();
  });
});
