import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { KeystrokeReplay } from './KeystrokeReplay';

const keystrokes = [
  { id: 1, relativeTimestamp: 0, snapshot: 'H' },
  { id: 2, relativeTimestamp: 100, snapshot: 'He' },
  { id: 3, relativeTimestamp: 200, snapshot: 'Hel' },
  { id: 4, relativeTimestamp: 300, snapshot: 'Hell' },
  { id: 5, relativeTimestamp: 400, snapshot: 'Hello' },
];

// setup function
function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('KeystrokeReplay', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with initial text and no keystrokes', () => {
    render(
      <KeystrokeReplay
        keystrokes={[]}
        initialText='Start'
      />,
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByTestId('play')).toBeDisabled();
  });

  it('renders language and duration indicators', () => {
    render(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
        language='javascript'
      />,
    );
    expect(screen.getByLabelText(/programming language/i)).toHaveTextContent(
      'javascript',
    );
    expect(screen.getByLabelText(/answer duration/i)).toHaveTextContent(
      'Duration: 0:00',
    );
  });

  it('plays through keystrokes and calls onComplete', async () => {
    const onComplete = vi.fn();
    const { user } = setup(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
        onComplete={onComplete}
      />,
    );

    const playBtn = screen.getByTestId('play');
    await user.click(playBtn);
    // Advance timers to complete the replay
    act(() => {
      for (let i = 0; i < keystrokes.length; i++) {
        vi.advanceTimersToNextTimer();
      }
    });

    expect(onComplete).toHaveBeenCalled();
    // Play button should be enabled again
    expect(playBtn).toBeEnabled();
  });

  it('pause and resume works', async () => {
    const { user } = setup(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
      />,
    );
    const playBtn = screen.getByTestId('play');
    await user.click(playBtn);
    // Advance one step
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Pause
    const pauseBtn = screen.getByTestId('pause');
    await user.click(pauseBtn);
    // Should still show the last snapshot
    expect(screen.getByText('He')).toBeInTheDocument();
    // Play again
    await user.click(playBtn);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText('Hel')).toBeInTheDocument();
  });

  it('reset returns to initial state', async () => {
    const { user } = setup(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
      />,
    );
    const playBtn = screen.getByTestId('play');
    await user.click(playBtn);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('Hel')).toBeInTheDocument();
    // Reset
    const resetBtn = screen.getByTestId('reset');
    await user.click(resetBtn);
    expect(screen.getByTestId('code-snippet')).toHaveTextContent('');
    expect(playBtn).toBeEnabled();
  });

  it('seek moves to correct snapshot', async () => {
    render(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
      />,
    );
    const range = screen.getByRole('slider');
    // Seek to 50%
    fireEvent.change(range, { target: { value: 50 } });
    // Should show a snapshot close to the middle
    expect(screen.getByTestId('code-snippet')).toHaveTextContent('Hel');
  });

  it('speed control changes speed', async () => {
    const { user } = setup(
      <KeystrokeReplay
        keystrokes={keystrokes}
        initialText=''
      />,
    );
    const playBtn = screen.getByTestId('play');
    await user.click(playBtn);
    // Change speed to 2x
    const select = screen.getByTestId('speed');
    await user.selectOptions(select, '2');
    // Advance time (should be twice as fast)
    act(() => {
      vi.advanceTimersByTime(50); // 100ms/2 = 50ms per step
    });
    expect(screen.getByTestId('code-snippet')).toHaveTextContent('He');
  });

  it('hides controls if controls=false', () => {
    render(
      <KeystrokeReplay
        keystrokes={keystrokes}
        controls={false}
      />,
    );
    expect(screen.queryByTestId('play')).not.toBeInTheDocument();
    expect(screen.queryByTestId('slider')).not.toBeInTheDocument();
  });
});
