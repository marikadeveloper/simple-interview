import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  FeedbackInterviewFragment,
  InterviewEvaluation,
  useEvaluateInterviewMutation,
  useGetInterviewForFeedbackQuery,
} from '@/generated/graphql';
import { Crown, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { toast } from 'sonner';

const InterviewFeedback: React.FC = () => {
  const { id } = useParams();
  const [{ data, fetching, error }] = useGetInterviewForFeedbackQuery({
    variables: { id: parseInt(id as string) },
  });
  const [, evaluateInterview] = useEvaluateInterviewMutation();
  const [evaluation, setEvaluation] = useState<
    | {
        rating?: InterviewEvaluation | null;
        notes?: string | null;
      }
    | undefined
  >();

  useEffect(() => {
    if (data?.getInterview) {
      setEvaluation({
        rating: data.getInterview.evaluationValue,
        notes: data.getInterview.evaluationNotes,
      });
    }
  }, [data]);

  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.getInterview) return <div>No data</div>;

  const interview: FeedbackInterviewFragment = data.getInterview;

  const handleEvaluation = (rating: InterviewEvaluation) => {
    if (evaluation?.rating === rating) {
      setEvaluation(undefined);
    } else {
      setEvaluation({
        rating,
      });
    }
  };

  const submitEvaluation = async () => {
    if (!evaluation?.rating) return;
    const { data } = await evaluateInterview({
      id: interview.id,
      input: {
        evaluationValue: evaluation.rating,
        evaluationNotes: evaluation?.notes,
      },
    });
    if (data?.evaluateInterview) {
      toast('Evaluation submitted successfully');
    } else {
      toast('Failed to submit evaluation');
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

      <div className='bg-white rounded-lg shadow-sm p-8 mb-8 mt-8'>
        <h3 className='text-2xl font-semibold mb-8'>
          How did the interview go?
        </h3>
        <div className='space-y-8'>
          <div className='flex items-center justify-center gap-8'>
            <div className='flex flex-col items-center gap-3'>
              <Button
                variant='outline'
                className={`h-20 w-20 transition-all duration-200 ${
                  evaluation?.rating === InterviewEvaluation.Bad
                    ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white ring-4 ring-red-200'
                    : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
                onClick={() => handleEvaluation(InterviewEvaluation.Bad)}>
                <ThumbsDown className='h-10 w-10' />
              </Button>
              <span className='text-base font-medium text-gray-700'>
                Not Good
              </span>
            </div>

            <div className='flex flex-col items-center gap-3'>
              <Button
                variant='outline'
                className={`h-20 w-20 transition-all duration-200 ${
                  evaluation?.rating === InterviewEvaluation.Good
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:text-white ring-4 ring-green-200'
                    : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => handleEvaluation(InterviewEvaluation.Good)}>
                <ThumbsUp className='h-10 w-10' />
              </Button>
              <span className='text-base font-medium text-gray-700'>Good</span>
            </div>

            <div className='flex flex-col items-center gap-3'>
              <Button
                variant='outline'
                className={`h-20 w-20 transition-all duration-200 ${
                  evaluation?.rating === InterviewEvaluation.Excellent
                    ? 'bg-violet-500 text-white hover:bg-violet-600 hover:text-white ring-4 ring-violet-200'
                    : 'text-violet-500 hover:text-violet-600 hover:bg-violet-50'
                }`}
                onClick={() => handleEvaluation(InterviewEvaluation.Excellent)}>
                <Crown className='h-10 w-10' />
              </Button>
              <span className='text-base font-medium text-gray-700'>
                Excellent
              </span>
            </div>
          </div>

          <div className='max-w-2xl mx-auto space-y-4'>
            <Label htmlFor='feedback-notes'>Feedback Notes</Label>
            <Input
              id='feedback-notes'
              className='text-base py-3'
              placeholder='Add detailed feedback notes (optional)'
              value={evaluation?.notes || ''}
              onChange={(e) =>
                setEvaluation((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
            <Button
              className='w-full py-6 text-lg font-semibold transition-all duration-200'
              disabled={!evaluation?.rating}
              onClick={submitEvaluation}>
              Submit Evaluation
            </Button>
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
              <SyntaxHighlighter
                language={answer.language}
                className='rounded'>
                {answer.text}
              </SyntaxHighlighter>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewFeedback;
