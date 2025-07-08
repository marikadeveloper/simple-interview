import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FormHeading } from './FormHeading';

const mockUpdateInterviewTemplate = vi.fn();
const mockCreateTag = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useUpdateInterviewTemplateMutation: () => [
      null,
      mockUpdateInterviewTemplate,
    ],
    useCreateTagMutation: () => [null, mockCreateTag],
  };
});

vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (mutation: any) => {
    if (mutation.name === 'useUpdateInterviewTemplateMutation') {
      return [null, mockUpdateInterviewTemplate];
    }
    if (mutation.name === 'useCreateTagMutation') {
      return [null, mockCreateTag];
    }
    return [null, vi.fn()];
  },
}));

describe('FormHeading', () => {
  const setFormVisible = vi.fn();
  const interviewTemplate = {
    __typename: 'InterviewTemplate' as const,
    id: 1,
    name: 'Template 1',
    description: 'A test template',
    updatedAt: '',
    createdAt: '',
    slug: 'template-1',
    tags: [
      { __typename: 'Tag' as const, id: 1, text: 'tag1' },
      { __typename: 'Tag' as const, id: 2, text: 'tag2' },
    ],
  };
  const tags = [
    { label: 'tag1', value: '1' },
    { label: 'tag2', value: '2' },
  ];

  beforeEach(() => {
    mockUpdateInterviewTemplate.mockReset();
    mockCreateTag.mockReset();
    setFormVisible.mockReset();
  });

  it('renders the form with initial values', () => {
    render(
      <FormHeading
        interviewTemplate={interviewTemplate}
        tags={tags}
        setFormVisible={setFormVisible}
      />,
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Template 1');
    expect(screen.getByLabelText('Description')).toHaveValue('A test template');
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <FormHeading
        interviewTemplate={interviewTemplate}
        tags={tags}
        setFormVisible={setFormVisible}
      />,
    );
    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(
      await screen.findByText(/at least 2 characters/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/at least 5 characters/i),
    ).toBeInTheDocument();
  });

  it('calls updateInterviewTemplate mutation and closes form on success', async () => {
    mockUpdateInterviewTemplate.mockResolvedValue({ error: null });
    render(
      <FormHeading
        interviewTemplate={interviewTemplate}
        tags={tags}
        setFormVisible={setFormVisible}
      />,
    );
    await userEvent.type(screen.getByLabelText('Name'), ' Updated');
    await userEvent.type(screen.getByLabelText('Description'), ' Updated');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockUpdateInterviewTemplate).toHaveBeenCalled();
      expect(setFormVisible).toHaveBeenCalledWith(false);
    });
  });

  it('does not close form if mutation returns error', async () => {
    mockUpdateInterviewTemplate.mockResolvedValue({ error: 'fail' });
    render(
      <FormHeading
        interviewTemplate={interviewTemplate}
        tags={tags}
        setFormVisible={setFormVisible}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(setFormVisible).not.toHaveBeenCalledWith(false);
    });
  });

  it('calls setFormVisible(false) and resets form on cancel', async () => {
    render(
      <FormHeading
        interviewTemplate={interviewTemplate}
        tags={tags}
        setFormVisible={setFormVisible}
      />,
    );
    await userEvent.type(screen.getByLabelText('Name'), ' Updated');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setFormVisible).toHaveBeenCalledWith(false);
    // Name should be reset to original value
    expect(screen.getByLabelText('Name')).toHaveValue('Template 1');
  });
});
