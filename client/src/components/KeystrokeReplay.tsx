import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keystroke } from '../generated/graphql';
import { reconstructText } from '../utils/keystrokeCapture';

interface KeystrokeReplayProps {
  keystrokes: Keystroke[];
  initialText?: string;
  className?: string;
  speed?: number; // Speed multiplier, 1 = normal speed
  onComplete?: () => void;
  controls?: boolean;
}

export const KeystrokeReplay: React.FC<KeystrokeReplayProps> = ({
  keystrokes,
  initialText = '',
  className = '',
  speed = 1,
  onComplete,
  controls = true,
}) => {
  const [currentText, setCurrentText] = useState(initialText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100%
  const [currentKeystrokeIndex, setCurrentKeystrokeIndex] = useState(-1);

  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sortedKeystrokes = useRef<Keystroke[]>([]);

  // Sort keystrokes by timestamp when they change
  useEffect(() => {
    if (keystrokes?.length > 0) {
      sortedKeystrokes.current = [...keystrokes].sort(
        (a, b) => a.relativeTimestamp - b.relativeTimestamp,
      );
    } else {
      sortedKeystrokes.current = [];
    }

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
    reset();
    setIsPlaying(true);

    if (sortedKeystrokes.current.length === 0) {
      setIsPlaying(false);
      if (onComplete) onComplete();
      return;
    }

    // Schedule the replay
    const replayKeystroke = (index: number) => {
      if (index >= sortedKeystrokes.current.length) {
        setIsPlaying(false);
        setProgress(100);
        if (onComplete) onComplete();
        return;
      }

      const keystroke = sortedKeystrokes.current[index];
      setCurrentKeystrokeIndex(index);

      // Apply keystroke to build the text
      setCurrentText((prevText) => {
        const keystrokes = sortedKeystrokes.current.slice(0, index + 1);
        return reconstructText(keystrokes);
      });

      // Calculate progress
      const totalDuration =
        sortedKeystrokes.current[sortedKeystrokes.current.length - 1]
          .relativeTimestamp;
      setProgress(
        Math.min(100, (keystroke.relativeTimestamp / totalDuration) * 100),
      );

      // Schedule next keystroke
      if (index < sortedKeystrokes.current.length - 1) {
        const nextKeystroke = sortedKeystrokes.current[index + 1];
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

    // Start replaying from the first keystroke
    replayKeystroke(0);
  }, [initialText, speed, onComplete]);

  const pause = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const seek = useCallback(
    (percent: number) => {
      if (sortedKeystrokes.current.length === 0) return;

      pause();

      // Find index closest to the requested position
      const totalDuration =
        sortedKeystrokes.current[sortedKeystrokes.current.length - 1]
          .relativeTimestamp;
      const targetTime = (percent / 100) * totalDuration;

      let index = 0;
      while (
        index < sortedKeystrokes.current.length &&
        sortedKeystrokes.current[index].relativeTimestamp <= targetTime
      ) {
        index++;
      }
      index = Math.max(0, index - 1);

      setCurrentKeystrokeIndex(index);
      setProgress(percent);

      // Rebuild text up to this point
      if (index >= 0) {
        const keystrokes = sortedKeystrokes.current.slice(0, index + 1);
        setCurrentText(reconstructText(keystrokes));
      } else {
        setCurrentText(initialText);
      }
    },
    [initialText, pause],
  );

  return (
    <div className='keystroke-replay'>
      <pre className={className}>{currentText || initialText}</pre>

      {controls && (
        <div className='keystroke-replay-controls'>
          <div className='buttons'>
            {!isPlaying ? (
              <button
                onClick={play}
                disabled={sortedKeystrokes.current.length === 0}>
                Play
              </button>
            ) : (
              <button onClick={pause}>Pause</button>
            )}
            <button onClick={reset}>Reset</button>
          </div>

          <div className='progress'>
            <input
              type='range'
              min='0'
              max='100'
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span>{progress.toFixed(0)}%</span>
          </div>

          <div className='speed-control'>
            <label>
              Speed:
              <select
                value={speed}
                onChange={(e) => {
                  const wasPlaying = isPlaying;
                  pause();
                  // Update speed logic would go here
                  if (wasPlaying) play();
                }}>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
