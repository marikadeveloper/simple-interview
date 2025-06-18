import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { DetailPageSkeleton } from '@/components/ui/skeleton';
import {
  AnswerWithKeystrokesFragment,
  QuestionFragment,
  ReplayInterviewFragment,
  useGetInterviewForReplayBySlugQuery,
} from '@/generated/graphql';
import { NotFoundPage } from '@/pages/auth/NotFoundPage';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { KeystrokeReplay } from '../components/KeystrokeReplay';

export const ReadonlyInterview = () => {
  const { slug } = useParams();
  const [{ data, error, fetching }] = useGetInterviewForReplayBySlugQuery({
    variables: { slug: slug as string },
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  if (fetching) {
    return <DetailPageSkeleton />;
  }

  if (error || !data || !data.getInterviewBySlug)
    return <NotFoundPage message='Interview not found' />;

  const interview: ReplayInterviewFragment = data.getInterviewBySlug;
  const question: QuestionFragment =
    interview.interviewTemplate.questions[currentQuestionIndex];
  const answer: AnswerWithKeystrokesFragment = interview.answers?.find(
    (answer) => answer.question.id === question.id,
  ) as AnswerWithKeystrokesFragment;
  const isLastQuestion =
    currentQuestionIndex === interview.interviewTemplate.questions.length - 1;

  return (
    <div className='container mx-auto'>
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
            language={answer?.language}
            initialText={answer?.text}
            keystrokes={answer?.keystrokes || []}
          />
        </div>

        <div className='flex items-center justify-between pt-4 border-t'>
          <Button
            variant='outline'
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className='disabled:opacity-50 disabled:cursor-not-allowed'>
            Previous
          </Button>
          {!isLastQuestion && (
            <Button
              variant='outline'
              onClick={nextQuestion}
              className='disabled:opacity-50 disabled:cursor-not-allowed'>
              Next
            </Button>
          )}
          {isLastQuestion && (
            <Link to={`/interviews/${slug}/feedback`}>
              <Button>Give feedback</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
