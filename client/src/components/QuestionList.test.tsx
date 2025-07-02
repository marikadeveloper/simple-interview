import { render, screen } from '@testing-library/react';
import { QuestionList } from './QuestionList';

// Mock QuestionCard to just render the question id
vi.mock('./QuestionCard', () => ({
  QuestionCard: ({ question }: any) => (
    <div data-testid='question-card'>{question.id}</div>
  ),
}));

describe('QuestionList', () => {
  it('renders no question cards if questions is empty', () => {
    render(<QuestionList questions={[]} />);
    expect(screen.queryAllByTestId('question-card')).toHaveLength(0);
  });

  it('renders a single question card', () => {
    render(<QuestionList questions={[{ id: 'q1' } as any]} />);
    const cards = screen.getAllByTestId('question-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('q1');
  });

  it('renders multiple question cards', () => {
    render(
      <QuestionList
        questions={[
          { id: 'q1' } as any,
          { id: 'q2' } as any,
          { id: 'q3' } as any,
        ]}
      />,
    );
    const cards = screen.getAllByTestId('question-card');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('q1');
    expect(cards[1]).toHaveTextContent('q2');
    expect(cards[2]).toHaveTextContent('q3');
  });
});
