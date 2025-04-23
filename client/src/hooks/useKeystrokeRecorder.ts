import { useCallback, useEffect, useRef, useState } from 'react';
import { KeystrokeInput } from '../generated/graphql';
import { KeystrokeRecorder } from '../utils/keystrokeCapture';

type KeystrokeHandlerOptions = {
  batchSize?: number;
  onBatchComplete?: (keystrokes: KeystrokeInput[]) => void;
  autoStart?: boolean;
};

export function useKeystrokeRecorder({
  batchSize = 20,
  onBatchComplete,
  autoStart = false,
}: KeystrokeHandlerOptions = {}) {
  const recorderRef = useRef<KeystrokeRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(autoStart);

  // Initialize the recorder
  useEffect(() => {
    recorderRef.current = new KeystrokeRecorder(batchSize, onBatchComplete);

    if (autoStart) {
      recorderRef.current.startRecording();
    }

    return () => {
      if (recorderRef.current) {
        const keystrokes = recorderRef.current.stopRecording();
        if (keystrokes.length > 0 && onBatchComplete) {
          onBatchComplete(keystrokes);
        }
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.startRecording();
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      const keystrokes = recorderRef.current.stopRecording();
      setIsRecording(false);
      if (onBatchComplete && keystrokes.length > 0) {
        onBatchComplete(keystrokes);
      }
      return keystrokes;
    }
    return [];
  }, [onBatchComplete]);

  // Handlers for different text editing operations
  const handleInsert = useCallback(
    (position: number, text: string) => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.insertText(position, text);
      }
    },
    [isRecording],
  );

  const handleDelete = useCallback(
    (position: number, length: number) => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.deleteText(position, length);
      }
    },
    [isRecording],
  );

  const handleReplace = useCallback(
    (position: number, length: number, text: string) => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.replaceText(position, length, text);
      }
    },
    [isRecording],
  );

  const getAllKeystrokes = useCallback(() => {
    return recorderRef.current?.getAllKeystrokes() || [];
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    handleInsert,
    handleDelete,
    handleReplace,
    getAllKeystrokes,
  };
}
