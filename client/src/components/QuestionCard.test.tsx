import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionFragment } from '../generated/graphql';
import { QuestionCard } from './QuestionCard';

// Mock the useMutationWithToast hook
vi.mock('../hooks/useMutationWithToast', () => ({
  useMutationWithToast: vi.fn(),
}));

const mockUseMutationWithToast = vi.mocked(
  await import('../hooks/useMutationWithToast'),
).useMutationWithToast;

describe('QuestionCard', () => {
  const mockCreateQuestion = vi.fn();
  const mockUpdateQuestion = vi.fn();
  const mockDeleteQuestion = vi.fn();

  const mockQuestion: QuestionFragment = {
    id: 1,
    title: 'Test Question',
    description: 'Test Description',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    questionBank: {
      id: 1,
      name: 'Test Bank',
      slug: 'test-bank',
    },
    __typename: 'Question',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockUseMutationWithToast as any).mockImplementation(
      (mutationHook: any) => {
        const mockState = {
          data: null,
          error: null,
          fetching: false,
          stale: false,
          hasNext: false,
        };

        if (mutationHook.name.includes('Create')) {
          return [mockState, mockCreateQuestion];
        } else if (mutationHook.name.includes('Update')) {
          return [mockState, mockUpdateQuestion];
        } else if (mutationHook.name.includes('Delete')) {
          return [mockState, mockDeleteQuestion];
        }
        return [mockState, vi.fn()];
      },
    );
  });

  describe('Create Mode', () => {
    it('should render create form when templateId is provided', () => {
      render(<QuestionCard templateId='1' />);

      expect(screen.getByText('Create Question')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question title'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question description'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });

    it('should render create form when questionBankId is provided', () => {
      render(<QuestionCard questionBankId='1' />);

      expect(screen.getByText('Create Question')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question title'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question description'),
      ).toBeInTheDocument();
    });

    it('should have dashed border in create mode', () => {
      render(<QuestionCard templateId='1' />);

      const card = screen.getByTestId('question-card');
      expect(card).toHaveClass('border-dashed');
    });

    it('should validate form fields and show errors', async () => {
      const user = userEvent.setup();
      render(<QuestionCard templateId='1' />);

      const titleInput = screen.getByPlaceholderText('Enter question title');
      const descriptionInput = screen.getByPlaceholderText(
        'Enter question description',
      );
      const saveButton = screen.getByRole('button', { name: 'Save' });

      // Try to submit with invalid data
      await user.click(saveButton);

      // Should show validation errors
      await waitFor(() => {
        expect(
          screen.getByText('Title must be at least 2 characters.'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Description must be at least 5 characters.'),
        ).toBeInTheDocument();
      });

      // Enter valid data
      await user.type(titleInput, 'Valid Title');
      await user.type(
        descriptionInput,
        'Valid description with more than 5 characters',
      );

      // Errors should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText('Title must be at least 2 characters.'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Description must be at least 5 characters.'),
        ).not.toBeInTheDocument();
      });
    });

    it('should call createQuestion mutation on successful form submission', async () => {
      const user = userEvent.setup();
      mockCreateQuestion.mockResolvedValue({
        data: { createQuestion: { id: 1 } },
        error: null,
      });

      render(<QuestionCard templateId='1' />);

      const titleInput = screen.getByPlaceholderText('Enter question title');
      const descriptionInput = screen.getByPlaceholderText(
        'Enter question description',
      );
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.type(titleInput, 'New Question');
      await user.type(descriptionInput, 'New question description');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockCreateQuestion).toHaveBeenCalledWith({
          input: {
            title: 'New Question',
            description: 'New question description',
            interviewTemplateId: 1,
          },
        });
      });
    });

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup();
      mockCreateQuestion.mockResolvedValue({
        data: { createQuestion: { id: 1 } },
        error: null,
      });

      render(<QuestionCard templateId='1' />);

      const titleInput = screen.getByPlaceholderText('Enter question title');
      const descriptionInput = screen.getByPlaceholderText(
        'Enter question description',
      );
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.type(titleInput, 'New Question');
      await user.type(descriptionInput, 'New question description');
      await user.click(saveButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
      });
    });
  });

  describe('Edit Mode', () => {
    it('should render question data in read-only mode initially', () => {
      render(<QuestionCard question={mockQuestion} />);

      expect(screen.getByText('Test Question')).toBeInTheDocument();
      const desc = screen.getByTestId('question-description-readonly');
      expect(desc).toBeVisible();
      expect(desc.tagName).toBe('P');
      expect(desc).toHaveTextContent('Test Description');
      expect(screen.getByText('From: Test Bank')).toBeInTheDocument();
      expect(screen.getByTestId('edit-question-btn')).toBeInTheDocument();
      const saveBtn = screen.queryByRole('button', { name: 'Save' });
      if (saveBtn) expect(saveBtn).not.toBeVisible();
    });

    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
      const textarea = screen.getByTestId('question-description-textarea');
      expect(textarea).toBeVisible();
      expect(textarea).toHaveValue('Test Description');
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('delete-question-btn')).toBeInTheDocument();
    });

    it('should call updateQuestion mutation on successful form submission', async () => {
      const user = userEvent.setup();
      mockUpdateQuestion.mockResolvedValue({
        data: { updateQuestion: { id: 1 } },
        error: null,
      });

      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Question');
      const descriptionInput = screen.getByTestId(
        'question-description-textarea',
      );
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Question');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalledWith({
          id: 1,
          input: {
            title: 'Updated Question',
            description: 'Updated description',
          },
        });
      });
    });

    it('should hide form after successful update', async () => {
      const user = userEvent.setup();
      mockUpdateQuestion.mockResolvedValue({
        data: { updateQuestion: { id: 1 } },
        error: null,
      });

      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Question');
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Question');
      await user.click(saveButton);

      await waitFor(() => {
        const saveBtn = screen.queryByRole('button', { name: 'Save' });
        if (saveBtn) expect(saveBtn).not.toBeVisible();
        expect(screen.getByTestId('edit-question-btn')).toBeInTheDocument();
        expect(screen.getByText('Updated Question')).toBeInTheDocument();
      });
    });

    it('should call deleteQuestion mutation when delete button is clicked', async () => {
      const user = userEvent.setup();
      mockDeleteQuestion.mockResolvedValue({
        data: { deleteQuestion: true },
        error: null,
      });

      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      const deleteButton = screen.getByTestId('delete-question-btn');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteQuestion).toHaveBeenCalledWith({
          id: 1,
        });
      });
    });

    it('should hide form after successful deletion', async () => {
      const user = userEvent.setup();
      mockDeleteQuestion.mockResolvedValue({
        data: { deleteQuestion: true },
        error: null,
      });

      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      const deleteButton = screen.getByTestId('delete-question-btn');
      await user.click(deleteButton);

      await waitFor(() => {
        const saveBtn = screen.queryByRole('button', { name: 'Save' });
        if (saveBtn) expect(saveBtn).not.toBeVisible();
        expect(screen.getByTestId('edit-question-btn')).toBeInTheDocument();
      });
    });

    it('should cancel edit and return to read-only mode', async () => {
      const user = userEvent.setup();
      render(<QuestionCard question={mockQuestion} />);

      const editButton = screen.getByTestId('edit-question-btn');
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Question');
      await user.clear(titleInput);
      await user.type(titleInput, 'Changed Title');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Test Question')).toBeInTheDocument();
        expect(screen.getByTestId('edit-question-btn')).toBeInTheDocument();
        const saveBtn = screen.queryByRole('button', { name: 'Save' });
        if (saveBtn) expect(saveBtn).not.toBeVisible();
      });
    });
  });

  describe('Unsupported Mode', () => {
    it('should render create form when no props are provided (defaults to create mode)', () => {
      render(<QuestionCard />);

      expect(screen.getByText('Create Question')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question title'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter question description'),
      ).toBeInTheDocument();
    });
  });

  describe('Question Bank Integration', () => {
    it('should display question bank label when question has questionBank', () => {
      render(<QuestionCard question={mockQuestion} />);

      expect(screen.getByText('From: Test Bank')).toBeInTheDocument();
    });

    it('should not display question bank label when question has no questionBank', () => {
      const questionWithoutBank = { ...mockQuestion, questionBank: null };
      render(<QuestionCard question={questionWithoutBank} />);

      expect(screen.queryByText('From: Test Bank')).not.toBeInTheDocument();
    });
  });
});
