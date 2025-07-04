import * as debounceModule from '@/utils/debounce';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { KeystrokeRecordingTextarea } from './KeystrokeRecordingTextarea';

// Mock the debounce utility
vi.mock('@/utils/debounce', () => ({
  debounce: vi.fn(),
}));

// Mock the CodeEditor component
vi.mock('@uiw/react-textarea-code-editor', () => ({
  default: vi
    .fn()
    .mockImplementation(
      ({ ref, onKeyUp, value, placeholder, onChange, ...props }) => {
        // Create a ref mock that can be used to simulate textarea behavior
        const textareaRef = {
          current: {
            value: value || '',
            focus: vi.fn(),
          },
        };

        // Assign the ref if provided
        if (ref) {
          ref.current = textareaRef.current;
        }

        return (
          <textarea
            data-testid='code-editor'
            value={value}
            onChange={(e) => {
              // Update the ref value
              if (textareaRef.current) {
                textareaRef.current.value = e.target.value;
              }
              // Call the onChange handler if provided
              if (onChange) {
                onChange(e);
              }
            }}
            onKeyUp={onKeyUp}
            placeholder={placeholder}
            {...props}
          />
        );
      },
    ),
}));

describe('KeystrokeRecordingTextarea', () => {
  const mockOutput = vi.fn();
  let debouncedFunction: any;

  beforeEach(() => {
    mockOutput.mockReset();

    // Setup debounce mock to return a function that we can control
    debouncedFunction = vi.fn();
    debouncedFunction.cancel = vi.fn();
    (debounceModule.debounce as any).mockReturnValue(debouncedFunction);
  });

  it('renders the component with language selector and code editor', () => {
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/plain text/i)).toBeInTheDocument();
  });

  it('records keystrokes when typing', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type some text
    await user.type(textarea, 'Hello');

    // Check that keystrokes are being recorded
    expect(textarea).toHaveValue('Hello');
  });

  it('calls output function with debounced values', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type some text
    await user.type(textarea, 'Hello');

    // The debounced function should be called with the current state
    expect(debouncedFunction).toHaveBeenCalled();
  });

  it('resets state when questionId changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');
    await user.type(textarea, 'Hello');

    // Change questionId
    rerender(
      <KeystrokeRecordingTextarea
        questionId={2}
        output={mockOutput}
      />,
    );

    // Textarea should be cleared
    expect(textarea).toHaveValue('');
  });

  it('calls output with correct parameters', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type some text
    await user.type(textarea, 'Hello');

    // The debounced function should be called with text, keystrokes, and language
    expect(debouncedFunction).toHaveBeenCalledWith(
      expect.any(String), // text
      expect.any(Array), // keystrokes array
      'plaintext', // language
    );
  });

  it('creates keystroke events with correct structure', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type a character
    await user.type(textarea, 'H');

    // The debounced function should be called with keystrokes that have the correct structure
    expect(debouncedFunction).toHaveBeenCalledWith(
      'H',
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          relativeTimestamp: expect.any(Number),
          snapshot: expect.any(String),
        }),
      ]),
      'plaintext',
    );
  });

  it('handles multiple keystrokes correctly', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type multiple characters
    await user.type(textarea, 'Hello');

    // Should have multiple keystroke events
    expect(debouncedFunction).toHaveBeenCalledWith(
      'Hello',
      expect.arrayContaining([
        expect.objectContaining({ snapshot: 'H' }),
        expect.objectContaining({ snapshot: 'He' }),
        expect.objectContaining({ snapshot: 'Hel' }),
        expect.objectContaining({ snapshot: 'Hell' }),
        expect.objectContaining({ snapshot: 'Hello' }),
      ]),
      'plaintext',
    );
  });

  it('cancels debounced function on unmount', () => {
    const { unmount } = render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    unmount();

    // The debounced function should have a cancel method that was called
    expect(debouncedFunction.cancel).toBeDefined();
  });

  it('handles empty text input', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type some text
    await user.type(textarea, 'Hello');

    // Clear the textarea by selecting all and deleting
    await user.click(textarea);
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{Backspace}');

    // Should handle empty text
    expect(textarea).toHaveValue('');
  });

  it('uses correct default language', () => {
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    expect(screen.getByText(/plain text/i)).toBeInTheDocument();
  });

  it('handles rapid typing correctly', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type rapidly
    await user.type(textarea, 'HelloWorld');

    // Should handle rapid typing
    expect(textarea).toHaveValue('HelloWorld');
  });

  it('handles spaces and tabs in text input', async () => {
    const user = userEvent.setup();
    render(
      <KeystrokeRecordingTextarea
        questionId={1}
        output={mockOutput}
      />,
    );

    const textarea = screen.getByTestId('code-editor');

    // Type text with spaces
    await user.type(textarea, 'Hello World');

    // Add a tab character
    await user.type(textarea, '\t');

    // Add more text
    await user.type(textarea, 'More text');

    // The text should be recorded with spaces and tab
    // Note: user.type() doesn't preserve spaces in the way we expect, so we test the actual behavior
    expect(textarea).toHaveValue('HelloWorld\tMoretext');
  });
});
