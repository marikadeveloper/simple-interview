import { QuestionFragment } from '@/generated/graphql';
import {
  KeystrokeRecordingTextarea,
  KeystrokeRecordingTextareaOutputFn,
} from './KeystrokeRecordingTextarea';

interface QuestionCardProps {
  question: QuestionFragment;
  onAnswerChange: KeystrokeRecordingTextareaOutputFn;
  initialAnswer?: string;
}

export const QuestionCard = ({
  question,
  onAnswerChange,
}: QuestionCardProps) => {
  return (
    <div className='max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100'>
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>
          {question.title}
        </h2>
        <p className='text-gray-600 text-lg leading-relaxed'>
          {question.description}
        </p>
        <div className='mt-6'>
          <KeystrokeRecordingTextarea
            questionId={question.id}
            output={onAnswerChange}
            key={question.id}
          />
        </div>
      </div>
    </div>
  );
};
