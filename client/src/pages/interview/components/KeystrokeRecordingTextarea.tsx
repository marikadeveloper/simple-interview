import React, { useCallback, useEffect, useRef } from 'react';
import { KeystrokeInput } from '../../../generated/graphql';
import { useKeystrokeRecorder } from '../../../hooks/useKeystrokeRecorder';

interface KeystrokeRecordingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeystrokesBatchComplete?: (keystrokes: KeystrokeInput[]) => void;
  onSaveKeystrokes?: (keystrokes: KeystrokeInput[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  rows?: number;
  answerId?: number;
}

export const KeystrokeRecordingTextarea: React.FC<
  KeystrokeRecordingTextareaProps
> = ({
  value,
  onChange,
  onKeystrokesBatchComplete,
  onSaveKeystrokes,
  className = '',
  placeholder = '',
  disabled = false,
  autoFocus = false,
  rows = 5,
  answerId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastValueRef = useRef<string>(value);
  const selectionStartRef = useRef<number>(0);

  const {
    isRecording,
    startRecording,
    stopRecording,
    handleInsert,
    handleDelete,
    handleReplace,
    getAllKeystrokes,
  } = useKeystrokeRecorder({
    onBatchComplete: onKeystrokesBatchComplete,
    autoStart: true,
  });

  // Handle text change detection and keystroke recording
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldValue = lastValueRef.current;
    const selectionStart = selectionStartRef.current;

    // Detect type of change
    if (newValue.length > oldValue.length) {
      // Text was added
      const addedText = newValue.slice(
        selectionStart,
        selectionStart + (newValue.length - oldValue.length),
      );
      handleInsert(selectionStart, addedText);
    } else if (newValue.length < oldValue.length) {
      // Text was deleted
      const deletedLength = oldValue.length - newValue.length;
      handleDelete(selectionStart, deletedLength);
    }

    // Update value
    lastValueRef.current = newValue;
    onChange(newValue);
  };

  // Track selection position for accurate keystroke recording
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    selectionStartRef.current = e.currentTarget.selectionStart;
  };

  // Save keystrokes when component unmounts or explicitly requested
  useEffect(() => {
    return () => {
      if (onSaveKeystrokes) {
        const keystrokes = getAllKeystrokes();
        if (keystrokes.length > 0) {
          onSaveKeystrokes(keystrokes);
        }
      }
    };
  }, [onSaveKeystrokes, getAllKeystrokes]);

  // Method to manually save collected keystrokes
  const saveKeystrokes = useCallback(() => {
    if (onSaveKeystrokes) {
      const keystrokes = getAllKeystrokes();
      if (keystrokes.length > 0) {
        onSaveKeystrokes(keystrokes);
      }
    }
  }, [onSaveKeystrokes, getAllKeystrokes]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onKeyUp={handleSelect}
      onKeyDown={handleSelect}
      onMouseDown={handleSelect}
      onMouseUp={handleSelect}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      rows={rows}
    />
  );
};
