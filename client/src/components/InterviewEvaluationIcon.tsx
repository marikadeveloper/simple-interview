import { InterviewEvaluation } from '@/generated/graphql';
import { Crown, ThumbsDown, ThumbsUp } from 'lucide-react';

export const InterviewEvaluationIcon: React.FC<{
  evaluation: InterviewEvaluation | null | undefined;
  className?: string;
}> = ({ evaluation, className }) => {
  switch (evaluation) {
    case InterviewEvaluation.Bad:
      return <ThumbsDown className={className} />;
    case InterviewEvaluation.Good:
      return <ThumbsUp className={className} />;
    case InterviewEvaluation.Excellent:
      return <Crown className={className} />;
    default:
      return null;
  }
};
