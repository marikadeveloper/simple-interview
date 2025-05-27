import { Button } from '@/components/ui/button';
import { Keystroke } from '@/generated/graphql';
import { reconstructText } from '@/utils/keystrokeReconstruct';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface KeystrokeReplayProps {
  keystrokes: Keystroke[];
  initialText?: string;
  language?: string;
  className?: string;
  speed?: number; // Speed multiplier, 1 = normal speed
  onComplete?: () => void;
  controls?: boolean;
}

export const KeystrokeReplay: React.FC<KeystrokeReplayProps> = ({
  keystrokes,
  initialText = '',
  language = '',
  className = '',
  speed: initialSpeed = 1,
  onComplete,
  controls = true,
}) => {
  const [currentText, setCurrentText] = useState(initialText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100%
  const [speed, setSpeed] = useState(initialSpeed);
  const [isDragging, setIsDragging] = useState(false);
  const [_, setCurrentKeystrokeIndex] = useState(-1);

  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number>(0);

  const sortedKeystrokes = useMemo(() => {
    return [...keystrokes].sort(
      (a, b) => a.relativeTimestamp - b.relativeTimestamp,
    );
  }, [keystrokes]);

  // Sort keystrokes by timestamp when they change
  useEffect(() => {
    // Reset state when keystrokes change
    reset();
  }, [keystrokes]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    setCurrentText(initialText);
    setIsPlaying(false);
    setProgress(0);
    setCurrentKeystrokeIndex(-1);
  }, [initialText]);

  const play = useCallback(() => {
    if (sortedKeystrokes.length === 0) {
      setIsPlaying(false);
      if (onComplete) onComplete();
      return;
    }

    setIsPlaying(true);

    // Find the current keystroke index based on progress
    const totalDuration =
      sortedKeystrokes[sortedKeystrokes.length - 1].relativeTimestamp;
    const currentTime = (progress / 100) * totalDuration;

    let startIndex = 0;
    while (
      startIndex < sortedKeystrokes.length &&
      sortedKeystrokes[startIndex].relativeTimestamp <= currentTime
    ) {
      startIndex++;
    }
    startIndex = Math.max(0, startIndex - 1);

    // Schedule the replay
    const replayKeystroke = (index: number) => {
      if (index >= sortedKeystrokes.length) {
        setIsPlaying(false);
        setProgress(100);
        if (onComplete) onComplete();
        return;
      }

      const keystroke = sortedKeystrokes[index];
      setCurrentKeystrokeIndex(index);

      // Apply only the current keystroke to update the text, instead of rebuilding from scratch
      setCurrentText(keystroke.snapshot);

      // Calculate progress
      const totalDuration =
        sortedKeystrokes[sortedKeystrokes.length - 1].relativeTimestamp;
      setProgress(
        Math.min(100, (keystroke.relativeTimestamp / totalDuration) * 100),
      );

      // Schedule next keystroke
      if (index < sortedKeystrokes.length - 1) {
        const nextKeystroke = sortedKeystrokes[index + 1];
        const delay =
          (nextKeystroke.relativeTimestamp - keystroke.relativeTimestamp) /
          speed;

        replayTimerRef.current = setTimeout(() => {
          replayKeystroke(index + 1);
        }, delay);
      } else {
        setIsPlaying(false);
        if (onComplete) onComplete();
      }
    };

    // Start replaying from the current position
    replayKeystroke(startIndex);
  }, [progress, speed, onComplete]);

  const pause = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const seek = useCallback(
    (percent: number) => {
      if (sortedKeystrokes.length === 0) return;

      pause();
      progressRef.current = percent;

      // Find index closest to the requested position
      const totalDuration =
        sortedKeystrokes[sortedKeystrokes.length - 1].relativeTimestamp;
      const targetTime = (percent / 100) * totalDuration;

      let index = 0;
      while (
        index < sortedKeystrokes.length &&
        sortedKeystrokes[index].relativeTimestamp <= targetTime
      ) {
        index++;
      }
      index = Math.max(0, index - 1);

      setCurrentKeystrokeIndex(index);
      setProgress(percent);

      // For seek operations, we do need to rebuild from scratch
      // but this happens much less frequently than during replay
      if (index >= 0) {
        const keystrokes = sortedKeystrokes.slice(0, index + 1);
        setCurrentText(reconstructText(keystrokes));
      } else {
        setCurrentText(initialText);
      }
    },
    [initialText, pause],
  );

  const handleSeekStart = useCallback(() => {
    setIsDragging(true);
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      const wasPlaying = isPlaying;
      pause();
      setSpeed(newSpeed);
      if (wasPlaying) {
        // Small delay to ensure state updates are processed
        setTimeout(() => play(), 0);
      }
    },
    [isPlaying, pause, play],
  );

  return (
    <div className='keystroke-replay w-full max-w-4xl mx-auto p-4 space-y-4'>
      <pre
        className={`${className} bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap break-words min-h-[100px] border border-gray-200 dark:border-gray-700`}>
        {currentText || initialText}
      </pre>

      {controls && (
        <div className='keystroke-replay-controls space-y-4'>
          <div className='player-controls flex flex-col items-center gap-4'>
            <div className='progress w-full space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  0:00
                </span>
                <div className='relative flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden group'>
                  <div
                    className='absolute top-0 left-0 h-full bg-blue-500 transition-all duration-150 ease-out'
                    style={{ width: `${progress}%` }}
                  />

                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    onMouseDown={handleSeekStart}
                    onMouseUp={handleSeekEnd}
                    onTouchStart={handleSeekStart}
                    onTouchEnd={handleSeekEnd}
                    className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
                  />
                </div>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  100%
                </span>
              </div>
            </div>

            <div className='buttons flex items-center justify-center gap-4'>
              <Button
                onClick={reset}
                variant='ghost'
                size='icon'
                className='h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
                <RotateCcw className='h-5 w-5' />
              </Button>

              <Button
                onClick={() => seek(Math.max(0, progress - 10))}
                variant='ghost'
                size='icon'
                className='h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
                <SkipBack className='h-5 w-5' />
              </Button>

              {!isPlaying ? (
                <Button
                  onClick={play}
                  disabled={sortedKeystrokes.length === 0}
                  size='icon'
                  className='h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'>
                  <Play className='h-6 w-6' />
                </Button>
              ) : (
                <Button
                  onClick={pause}
                  size='icon'
                  className='h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white'>
                  <Pause className='h-6 w-6' />
                </Button>
              )}

              <Button
                onClick={() => seek(Math.min(100, progress + 10))}
                variant='ghost'
                size='icon'
                className='h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
                <SkipForward className='h-5 w-5' />
              </Button>

              <div className='speed-control ml-4'>
                <select
                  value={speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className='bg-transparent border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'>
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
