import type { QuestionFragment } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QuestionCard } from './QuestionCard';

// Mock KeystrokeRecordingTextarea to a simple button that triggers output
vi.mock('./KeystrokeRecordingTextarea', () => ({
  KeystrokeRecordingTextarea: ({ output }: any) => (
    <button
      onClick={() =>
        output('answer', [{ id: 1, relativeTimestamp: 0, snapshot: 'a' }], 'js')
      }
      data-testid='mock-textarea'>
      Mock Textarea
    </button>
  ),
}));

describe('QuestionCard (interview)', () => {
  const question: QuestionFragment = {
    __typename: 'Question',
    id: 123,
    title: 'What is React?',
    description: 'Explain the main idea of React.',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    questionBank: null,
  };

  it('renders the question title and description', () => {
    render(
      <QuestionCard
        question={question}
        onAnswerChange={vi.fn()}
      />,
    );
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(
      screen.getByText('Explain the main idea of React.'),
    ).toBeInTheDocument();
  });

  it('calls onAnswerChange when KeystrokeRecordingTextarea triggers output', async () => {
    const onAnswerChange = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswerChange={onAnswerChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByTestId('mock-textarea'));
    expect(onAnswerChange).toHaveBeenCalledWith(
      'answer',
      [{ id: 1, relativeTimestamp: 0, snapshot: 'a' }],
      'js',
    );
  });
});
