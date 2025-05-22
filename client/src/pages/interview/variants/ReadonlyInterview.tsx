import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  AnswerWithKeystrokesFragment,
  QuestionFragment,
  ReadonlyInterviewFragment,
  useGetInterviewQuery,
} from '@/generated/graphql';
import { useState } from 'react';
import { useParams } from 'react-router';
import { KeystrokeReplay } from '../components/KeystrokeReplay';

export const ReadonlyInterview = () => {
  const { id } = useParams();
  const [{ data, fetching, error }] = useGetInterviewQuery({
    variables: { id: parseInt(id as string) },
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  if (fetching) return <div>Loading...</div>;
  if (error || !data) return <div>Error: {error?.message}</div>;
  if (!data.getInterview) return <div>Interview not found</div>;

  const interview: ReadonlyInterviewFragment = data.getInterview;
  const question: QuestionFragment =
    interview.interviewTemplate.questions[currentQuestionIndex];
  const answer: AnswerWithKeystrokesFragment = interview.answers?.find(
    (answer) => answer.question.id === question.id,
  ) as AnswerWithKeystrokesFragment;

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>
            {interview.user.fullName} x {interview.interviewTemplate.name}
          </PageTitle>
          <PageSubtitle>Here you can replay the interview.</PageSubtitle>
        </div>
        <div className='flex items-center gap-2'></div>
      </div>

      <div className='py-8'>
        <div key={currentQuestionIndex}>
          <p>{question.title}</p>
          <p>{question.description}</p>
        </div>
        <KeystrokeReplay
          key={answer?.id}
          keystrokes={answer?.keystrokes || []}
        />
        <div className='flex items-center justify-between'>
          <Button onClick={previousQuestion}>Previous</Button>
          <Button onClick={nextQuestion}>Next</Button>
        </div>
      </div>
    </div>
  );
};
