import { Textarea } from '@/components/ui/textarea';
import {
  KeystrokeInput,
  KeystrokeType,
  QuestionFragment,
} from '@/generated/graphql';
import { useEffect, useRef, useState } from 'react';

interface QuestionCardProps {
  question: QuestionFragment;
  onAnswerChange: (answer: string, keystrokes: KeystrokeInput[]) => void;
  initialAnswer?: string;
}

export const QuestionCard = ({
  question,
  onAnswerChange,
}: QuestionCardProps) => {
  return (
    <div className='max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
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

interface KeystrokeRecordingTextareaProps {
  questionId: number;
  output: (text: string, keystrokes: KeystrokeInput[]) => void;
}

const KeystrokeRecordingTextarea = ({
  questionId,
  output,
}: KeystrokeRecordingTextareaProps) => {
  const [state, setState] = useState<{
    text: string;
    keystrokes: KeystrokeInput[];
  }>({ text: '', keystrokes: [] });
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setState({ text: '', keystrokes: [] });
    startTimeRef.current = Date.now();
  }, [questionId]);

  useEffect(() => {
    output(state.text, state.keystrokes);
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const currentTime = Date.now();
    const relativeTimestamp = currentTime - startTimeRef.current;
    const textarea = e.currentTarget;
    const position = textarea.selectionStart;

    // Handle backspace and delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const length = e.key === 'Backspace' ? 1 : 1;
      const newKeystroke: KeystrokeInput = {
        type: KeystrokeType.Delete,
        position,
        length,
        relativeTimestamp,
      };
      setState((prev) => ({
        ...prev,
        keystrokes: [...prev.keystrokes, newKeystroke],
      }));
      return;
    }

    // Handle regular character input
    if (e.key.length === 1) {
      const newKeystroke: KeystrokeInput = {
        type: KeystrokeType.Insert,
        position,
        value: e.key,
        relativeTimestamp,
      };
      setState((prev) => ({
        ...prev,
        keystrokes: [...prev.keystrokes, newKeystroke],
      }));
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({
      ...prev,
      text: e.target.value,
    }));
  };

  return (
    <Textarea
      value={state.text}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      className='min-h-[200px] w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none'
      placeholder='Type your answer here...'
    />
  );
};
