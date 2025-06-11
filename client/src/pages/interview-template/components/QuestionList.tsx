import { QuestionFragment } from '@/generated/graphql';
import { QuestionCard } from './QuestionCard';

export const QuestionList = ({
  questions,
}: {
  questions: QuestionFragment[];
}) => {
  return (
    <div className='flex flex-col gap-4'>
      {questions?.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
        />
      ))}
    </div>
  );
};
