import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeystrokeInput, KeystrokeType } from '@/generated/graphql';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useEffect, useRef, useState } from 'react';

interface KeystrokeRecordingTextareaProps {
  questionId: number;
  output: (
    text: string,
    keystrokes: KeystrokeInput[],
    language: string,
  ) => void;
}

const languages = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'js', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

export const KeystrokeRecordingTextarea = ({
  questionId,
  output,
}: KeystrokeRecordingTextareaProps) => {
  const [state, setState] = useState<{
    text: string;
    keystrokes: KeystrokeInput[];
  }>({ text: '', keystrokes: [] });
  const startTimeRef = useRef<number>(Date.now());
  const [language, setLanguage] = useState('plaintext');

  useEffect(() => {
    setState({ text: '', keystrokes: [] });
    startTimeRef.current = Date.now();
  }, [questionId]);

  useEffect(() => {
    output(state.text, state.keystrokes, language);
  }, [state, language]);

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
    <div className='space-y-2'>
      <div className='flex justify-end'>
        <Select
          value={language}
          onValueChange={setLanguage}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem
                key={lang.value}
                value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CodeEditor
        language={language}
        value={state.text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={`Please enter ${
          languages.find((l) => l.value === language)?.label || 'code'
        } here...`}
        padding={15}
        style={{
          backgroundColor: 'white',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          minHeight: '200px',
        }}
      />
    </div>
  );
};
