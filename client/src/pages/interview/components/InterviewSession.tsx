import {
  CandidateInterviewFragment,
  KeystrokeInput,
  useConfirmInterviewCompletionMutation,
  useCreateAnswerMutation,
  useSaveKeystrokesMutation,
} from '@/generated/graphql';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { QuestionCard } from './QuestionCard';

interface InterviewSessionProps {
  interview: CandidateInterviewFragment;
}

export const InterviewSession = ({ interview }: InterviewSessionProps) => {
  const navigate = useNavigate();
  // start from the first question that does not have any answer
  const lastQuestionWithNoAnswer =
    interview.interviewTemplate.questions.findIndex(
      (question) =>
        !interview.answers?.some(
          (answer) => answer.question.id === question.id,
        ),
    );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    lastQuestionWithNoAnswer,
  );
  const [answers, setAnswers] = useState<
    Record<
      number,
      { text: string; keystrokes: KeystrokeInput[]; language: string }
    >
  >({});

  const [, createAnswer] = useMutationWithToast(useCreateAnswerMutation, {
    successMessage: 'Answer created successfully',
    errorMessage: 'Failed to create answer',
  });
  const [, confirmCompletion] = useMutationWithToast(
    useConfirmInterviewCompletionMutation,
    {
      successMessage: 'Interview completed successfully',
      errorMessage: 'Failed to complete interview',
    },
  );
  const [, saveKeystrokes] = useMutationWithToast(useSaveKeystrokesMutation, {
    successMessage: 'Keystrokes saved successfully',
    errorMessage: 'Failed to save keystrokes',
  });

  const currentQuestion =
    interview.interviewTemplate.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === interview.interviewTemplate.questions.length - 1;

  const handleAnswerChange = useCallback(
    (
      questionId: number,
      text: string,
      keystrokes: KeystrokeInput[],
      language: string,
    ) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { text, keystrokes, language },
      }));
    },
    [],
  );

  const handleNext = useCallback(async () => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentAnswer) {
      const { data, error } = await createAnswer({
        input: {
          interviewId: interview.id,
          questionId: currentQuestion.id,
          text: currentAnswer.text,
          language: currentAnswer.language,
        },
      });

      if (error) {
        return;
      }

      if (data?.createAnswer) {
        const { error } = await saveKeystrokes({
          input: {
            answerId: data.createAnswer.id,
            keystrokes: currentAnswer.keystrokes,
          },
        });

        if (error) {
          return;
        }
      }
    }

    if (isLastQuestion) {
      // TODO: replace this with a dialog
      const confirmed = window.confirm(
        'Are you sure you want to end the interview?',
      );
      if (confirmed) {
        const { error } = await confirmCompletion({ id: interview.id });
        if (error) {
          return;
        }
        navigate('/dashboard', {
          state: { message: 'Thank you for completing the interview!' },
        });
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [
    currentQuestion,
    answers,
    isLastQuestion,
    interview.id,
    createAnswer,
    confirmCompletion,
    navigate,
  ]);

  return (
    <div className='py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='mb-8 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Interview Session
          </h1>
          <div className='text-sm text-gray-600'>
            Question {currentQuestionIndex + 1} of{' '}
            {interview.interviewTemplate.questions.length}
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          onAnswerChange={(text, keystrokes, language) =>
            handleAnswerChange(currentQuestion.id, text, keystrokes, language)
          }
          initialAnswer={answers[currentQuestion.id]?.text}
        />

        <div className='mt-6 flex justify-end'>
          <button
            onClick={handleNext}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'>
            {isLastQuestion ? 'Complete Interview' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
