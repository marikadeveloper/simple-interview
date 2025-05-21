import { Textarea } from '@/components/ui/textarea';
import { KeystrokeInput, QuestionFragment } from '@/generated/graphql';
import { useEffect, useState } from 'react';

interface QuestionCardProps {
  question: QuestionFragment;
  onAnswerChange: (answer: string, keystrokes: KeystrokeInput[]) => void;
  initialAnswer?: string;
}

export const QuestionCard = ({
  question,
  onAnswerChange,
}: QuestionCardProps) => {
  const [answer, setAnswer] = useState<string>('');

  const onKeystrokesOutput = (keystrokes: KeystrokeInput[]) => {
    console.log('🚀 ~ onKeystrokesOutput ~ keystrokes:', keystrokes);
  };

  const onTextOutput = (text: string) => {
    setAnswer(text);
  };

  return (
    <div className='max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm'>
      <h2 className='text-xl font-semibold mb-2'>{question.title}</h2>
      <p className='text-gray-600 mb-6'>{question.description}</p>
      <KeystrokeRecordingTextarea
        questionId={question.id}
        keystrokesOutput={onKeystrokesOutput}
        textOutput={onTextOutput}
      />
    </div>
  );
};

interface KeystrokeRecordingTextareaProps {
  questionId: number; // to keep track of the question
  keystrokesOutput: (keystrokes: KeystrokeInput[]) => void;
  textOutput: (text: string) => void;
}
const KeystrokeRecordingTextarea = ({
  questionId,
  keystrokesOutput,
  textOutput,
}: KeystrokeRecordingTextareaProps) => {
  const [keystrokes, setKeystrokes] = useState<KeystrokeInput[]>([]);

  useEffect(() => {
    keystrokesOutput(keystrokes);
  }, [keystrokes]);

  // TODO: record keystrokes and convert them into KeystrokeInput[]
  // TODO: output also the text as it is typed

  return <Textarea />;
};
