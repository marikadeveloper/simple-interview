import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeystrokeInput } from '@/generated/graphql';
import { debounce } from '@/utils/debounce';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useCallback, useEffect, useRef, useState } from 'react';

export type KeystrokeRecordingTextareaOutputFn = (
  text: string,
  keystrokes: KeystrokeInput[],
  language: string,
) => void;
interface KeystrokeRecordingTextareaProps {
  questionId: number;
  output: KeystrokeRecordingTextareaOutputFn;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [language, setLanguage] = useState('plaintext');

  // Refs to store the current state for debouncing
  const keystrokesRef = useRef<KeystrokeInput[]>([]);
  const textRef = useRef<string>('');

  useEffect(() => {
    setState({ text: '', keystrokes: [] });
    keystrokesRef.current = [];
    textRef.current = '';
    startTimeRef.current = Date.now();
  }, [questionId]);

  // Debounced output function that will only be called after the user stops typing
  const debouncedOutput = useCallback(
    debounce((text: string, keystrokes: KeystrokeInput[], lang: string) => {
      output(text, keystrokes, lang);
    }, 300), // 300ms debounce delay
    [output],
  );

  // Call the debounced output function whenever state or language changes
  useEffect(() => {
    debouncedOutput(state.text, state.keystrokes, language);
  }, [state, language, debouncedOutput]);

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ state:', state);
  }, [state]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // TODO: do not record the keystroke if the key is a space or tab
    const timestamp = Date.now() - startTimeRef.current;
    const textarea = textareaRef.current;

    if (!textarea) return;

    console.log(e);
    if (e.code === 'Space' || e.code === 'Tab') return;

    const keystrokeEvent: KeystrokeInput = {
      relativeTimestamp: timestamp,
      snapshot: textarea.value,
    };

    setState((prev) => ({
      ...prev,
      text: textarea.value,
      keystrokes: [...prev.keystrokes, keystrokeEvent],
    }));
  };

  // Clean up any pending debounced calls when component unmounts
  useEffect(() => {
    return () => {
      debouncedOutput.cancel();
    };
  }, [debouncedOutput]);

  // Our performance optimization strategy:
  // 1. We don't debounce keystroke recording (handleKeyDown) to ensure we capture every keystroke accurately
  // 2. We debounce text updates at 50ms to improve typing responsiveness
  // 3. We debounce the output callback at 300ms to reduce parent component re-renders

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
      <div className='font-mono'>
        <CodeEditor
          ref={textareaRef}
          language={language}
          value={state.text}
          onKeyUp={handleKeyPress}
          placeholder={`Please enter ${
            languages.find((l) => l.value === language)?.label || 'code'
          } here...`}
          padding={15}
          className='rounded-md min-h-[200px]'
        />
      </div>
    </div>
  );
};
