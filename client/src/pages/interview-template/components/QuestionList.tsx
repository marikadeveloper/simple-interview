import { QuestionFragment } from '@/generated/graphql';
import { useState } from 'react';
import { QuestionCard } from './QuestionCard';

export const QuestionList = ({
  questions: dataQuestions,
}: {
  questions: QuestionFragment[];
}) => {
  const [questions, setQuestions] = useState<QuestionFragment[]>(dataQuestions);

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
