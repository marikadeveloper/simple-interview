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

  if (fetching)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    );
  if (error || !data)
    return (
      <div className='flex items-center justify-center min-h-screen text-red-500'>
        Error: {error?.message}
      </div>
    );
  if (!data.getInterview)
    return (
      <div className='flex items-center justify-center min-h-screen text-red-500'>
        Interview not found
      </div>
    );

  const interview: ReadonlyInterviewFragment = data.getInterview;
  const question: QuestionFragment =
    interview.interviewTemplate.questions[currentQuestionIndex];
  const answer: AnswerWithKeystrokesFragment = interview.answers?.find(
    (answer) => answer.question.id === question.id,
  ) as AnswerWithKeystrokesFragment;

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <PageTitle>
            {interview.user.fullName} x {interview.interviewTemplate.name}
          </PageTitle>
          <PageSubtitle>Here you can replay the interview.</PageSubtitle>
        </div>
        <div className='flex items-center gap-2'></div>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 space-y-6'>
        <div
          key={currentQuestionIndex}
          className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-semibold text-gray-800'>
              {question.title}
            </h2>
            <span className='text-sm font-medium text-gray-500'>
              Question {currentQuestionIndex + 1} of{' '}
              {interview.interviewTemplate.questions.length}
            </span>
          </div>
          <p className='text-gray-600'>{question.description}</p>
        </div>

        <div className='border rounded-lg p-4 bg-gray-50 min-h-[200px]'>
          <KeystrokeReplay
            key={answer?.id}
            keystrokes={answer?.keystrokes || []}
          />
        </div>

        <div className='flex items-center justify-between pt-4 border-t'>
          <Button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={
              currentQuestionIndex ===
              interview.interviewTemplate.questions.length - 1
            }
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
