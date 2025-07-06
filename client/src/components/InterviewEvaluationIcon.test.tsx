import { InterviewEvaluation } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { InterviewEvaluationIcon } from './InterviewEvaluationIcon';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ThumbsDown: ({ className }: { className?: string }) => (
    <span
      data-testid='thumbs-down'
      className={className}>
      ThumbsDown
    </span>
  ),
  ThumbsUp: ({ className }: { className?: string }) => (
    <span
      data-testid='thumbs-up'
      className={className}>
      ThumbsUp
    </span>
  ),
  Crown: ({ className }: { className?: string }) => (
    <span
      data-testid='crown'
      className={className}>
      Crown
    </span>
  ),
}));

describe('InterviewEvaluationIcon', () => {
  it('renders ThumbsDown icon for Bad evaluation', () => {
    render(
      <InterviewEvaluationIcon
        evaluation={InterviewEvaluation.Bad}
        className='test-class'
      />,
    );

    // Check that the ThumbsDown icon is rendered
    const thumbsDownIcon = screen.getByTestId('thumbs-down');
    expect(thumbsDownIcon).toBeInTheDocument();
    expect(thumbsDownIcon).toHaveClass('test-class');
  });

  it('renders ThumbsUp icon for Good evaluation', () => {
    render(
      <InterviewEvaluationIcon
        evaluation={InterviewEvaluation.Good}
        className='test-class'
      />,
    );

    // Check that the ThumbsUp icon is rendered
    const thumbsUpIcon = screen.getByTestId('thumbs-up');
    expect(thumbsUpIcon).toBeInTheDocument();
    expect(thumbsUpIcon).toHaveClass('test-class');
  });

  it('renders Crown icon for Excellent evaluation', () => {
    render(
      <InterviewEvaluationIcon
        evaluation={InterviewEvaluation.Excellent}
        className='test-class'
      />,
    );

    // Check that the Crown icon is rendered
    const crownIcon = screen.getByTestId('crown');
    expect(crownIcon).toBeInTheDocument();
    expect(crownIcon).toHaveClass('test-class');
  });

  it('renders nothing for null evaluation', () => {
    const { container } = render(<InterviewEvaluationIcon evaluation={null} />);

    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for undefined evaluation', () => {
    const { container } = render(
      <InterviewEvaluationIcon evaluation={undefined} />,
    );

    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className when provided', () => {
    render(
      <InterviewEvaluationIcon
        evaluation={InterviewEvaluation.Good}
        className='custom-class'
      />,
    );

    const thumbsUpIcon = screen.getByTestId('thumbs-up');
    expect(thumbsUpIcon).toHaveClass('custom-class');
  });

  it('works without className prop', () => {
    render(<InterviewEvaluationIcon evaluation={InterviewEvaluation.Bad} />);

    const thumbsDownIcon = screen.getByTestId('thumbs-down');
    expect(thumbsDownIcon).toBeInTheDocument();
    // Should not have any custom class
    expect(thumbsDownIcon.className).toBe('');
  });

  it('handles all evaluation types correctly', () => {
    const { rerender } = render(
      <InterviewEvaluationIcon evaluation={InterviewEvaluation.Bad} />,
    );
    expect(screen.getByTestId('thumbs-down')).toBeInTheDocument();

    rerender(<InterviewEvaluationIcon evaluation={InterviewEvaluation.Good} />);
    expect(screen.getByTestId('thumbs-up')).toBeInTheDocument();

    rerender(
      <InterviewEvaluationIcon evaluation={InterviewEvaluation.Excellent} />,
    );
    expect(screen.getByTestId('crown')).toBeInTheDocument();
  });
});
