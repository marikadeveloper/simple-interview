import { Textarea } from '@/components/ui/textarea';
import { KeystrokeInput, QuestionFragment } from '@/generated/graphql';
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
    <div className='max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm'>
      <h2 className='text-xl font-semibold mb-2'>{question.title}</h2>
      <p className='text-gray-600 mb-6'>{question.description}</p>
      <KeystrokeRecordingTextarea
        questionId={question.id}
        output={onAnswerChange}
        key={question.id}
      />
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
        type: 'DELETE',
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
        type: 'INSERT',
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
      className='min-h-[200px]'
      placeholder='Type your answer here...'
    />
  );
};
