import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeystrokeInput, KeystrokeType } from '@/generated/graphql';
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
    console.log('🚀 ~ useEffect ~ keystrokes:', state.keystrokes);
  }, [state.keystrokes]);

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ text:', state.text);
  }, [state.text]);

  // Process keydown events and collect keystrokes - we don't debounce this function
  // to ensure we capture every keystroke accurately
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const currentTime = Date.now();
      const relativeTimestamp = currentTime - startTimeRef.current;
      const textarea = e.currentTarget;
      const position = textarea.selectionStart;
      console.log('🚀 ~ handleKeyDown:', {
        e,
        currentTime,
        relativeTimestamp,
        position,
      });

      // Handle backspace and delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const length = e.key === 'Backspace' ? 1 : 1;
        const newKeystroke: KeystrokeInput = {
          type: KeystrokeType.Delete,
          position,
          length,
          relativeTimestamp,
        };
        keystrokesRef.current.push(newKeystroke);
        setState((prev) => ({
          ...prev,
          keystrokes: [...keystrokesRef.current],
        }));
        return;
      }

      if (e.key === 'Tab') {
        // Handle tab key
        e.preventDefault(); // Prevent default tab behavior
        const newKeystroke: KeystrokeInput = {
          type: KeystrokeType.Insert,
          position,
          value: '    ', // Insert 4 spaces for tab
          relativeTimestamp,
        };
        keystrokesRef.current.push(newKeystroke);
        setState((prev) => ({
          ...prev,
          keystrokes: [...keystrokesRef.current],
        }));
        return;
      }

      if (e.key === 'Enter') {
        // Handle Enter key
        const newKeystroke: KeystrokeInput = {
          type: KeystrokeType.Insert,
          position,
          value: '\n',
          relativeTimestamp,
        };
        keystrokesRef.current.push(newKeystroke);
        setState((prev) => ({
          ...prev,
          keystrokes: [...keystrokesRef.current],
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
        keystrokesRef.current.push(newKeystroke);
        setState((prev) => ({
          ...prev,
          keystrokes: [...keystrokesRef.current],
        }));
      }
    },
    [],
  );

  // Create a debounced handler for input changes
  const debouncedInputHandler = useCallback(
    debounce((newText: string) => {
      setState((prev) => ({
        ...prev,
        text: newText,
      }));
    }, 50), // 50ms debounce delay for text input
    [],
  );

  // Handle input changes
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      textRef.current = newText;
      debouncedInputHandler(newText);
    },
    [debouncedInputHandler],
  );

  // Clean up any pending debounced calls when component unmounts
  useEffect(() => {
    return () => {
      debouncedOutput.cancel();
      debouncedInputHandler.cancel();
    };
  }, [debouncedOutput, debouncedInputHandler]);

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
