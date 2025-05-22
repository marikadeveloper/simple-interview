import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  FeedbackInterviewFragment,
  useGetInterviewForFeedbackQuery,
} from '@/generated/graphql';
import { Crown, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';
import { useParams } from 'react-router';

enum Evaluation {
  Bad = 0,
  Good = 1,
  Excellent = 2,
}

const InterviewFeedback: React.FC = () => {
  const { id } = useParams();
  const [{ data, fetching, error }] = useGetInterviewForFeedbackQuery({
    variables: { id: parseInt(id as string) },
  });
  const [evaluation, setEvaluation] = useState<
    | {
        rating: Evaluation;
        notes?: string;
      }
    | undefined
  >();

  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.getInterview) return <div>No data</div>;

  const interview: FeedbackInterviewFragment = data.getInterview;

  const handleEvaluation = (rating: Evaluation) => {
    // TODO: Implement evaluation submission
    console.log('Evaluation:', rating);
    if (evaluation?.rating === rating) {
      setEvaluation(undefined);
    } else {
      setEvaluation({
        rating,
      });
    }
  };

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>
            {interview.user.fullName} x {interview.interviewTemplate.name}
          </PageTitle>
          <PageSubtitle>
            Here you can give feedback for the interview.
          </PageSubtitle>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-8 mb-8 mt-8 flex justify-between items-center'>
        <h3 className='text-xl font-semibold mb-6'>
          How did the interview go?
        </h3>
        <div className='flex items-center gap-4'>
          <div className='flex flex-col items-center gap-2'>
            <Button
              variant='outline'
              className={`h-16 w-16 ${
                evaluation?.rating === Evaluation.Bad
                  ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
                  : 'text-red-500 hover:text-red-600'
              }`}
              onClick={() => handleEvaluation(Evaluation.Bad)}>
              <ThumbsDown className='h-8 w-8' />
            </Button>
            <span className='text-sm text-gray-600'>Not Good</span>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <Button
              variant='outline'
              className={`h-16 w-16 ${
                evaluation?.rating === Evaluation.Good
                  ? 'bg-green-500 text-white hover:bg-green-600 hover:text-white'
                  : 'text-green-500 hover:text-green-600'
              }`}
              onClick={() => handleEvaluation(Evaluation.Good)}>
              <ThumbsUp className='h-8 w-8' />
            </Button>
            <span className='text-sm text-gray-600'>Good</span>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <Button
              variant='outline'
              className={`h-16 w-16 ${
                evaluation?.rating === Evaluation.Excellent
                  ? 'bg-violet-500 text-white hover:bg-violet-600 hover:text-white'
                  : 'text-violet-500 hover:text-violet-600'
              }`}
              onClick={() => handleEvaluation(Evaluation.Excellent)}>
              <Crown className='h-8 w-8' />
            </Button>
            <span className='text-sm text-gray-600'>Excellent</span>
          </div>
        </div>
      </div>

      <div className='py-8 space-y-8'>
        {interview.answers?.map((answer) => (
          <div
            key={answer.id}
            className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='text-xl font-semibold mb-2'>
              {answer.question.title}
            </h3>
            {answer.question.description && (
              <p className='text-gray-600 mb-4'>
                {answer.question.description}
              </p>
            )}
            <div className='bg-gray-50 rounded p-4'>
              <p className='whitespace-pre-wrap'>{answer.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewFeedback;
