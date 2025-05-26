import { KeystrokeInput, KeystrokeType } from '@/generated/graphql';

// Text reconstruction from keystrokes
export function reconstructText(keystrokes: KeystrokeInput[]): string {
  let text = '';

  // Sort keystrokes by relative timestamp to ensure they're processed in order
  const sortedKeystrokes = [...keystrokes].sort(
    (a, b) => a.relativeTimestamp - b.relativeTimestamp,
  );

  for (const keystroke of sortedKeystrokes) {
    switch (keystroke.type) {
      case KeystrokeType.Insert: {
        if (keystroke.value) {
          if (keystroke.position > text.length) {
            text = text.padEnd(keystroke.position, ' ') + keystroke.value;
          } else {
            text =
              text.substring(0, keystroke.position) +
              keystroke.value +
              text.substring(keystroke.position);
          }
        }
        break;
      }
      case KeystrokeType.Delete: {
        const length = keystroke.length || 1;
        if (keystroke.position < text.length) {
          text =
            text.substring(0, keystroke.position - 1) +
            text.substring(keystroke.position - 1 + length);
        }
        break;
      }
      case KeystrokeType.Replace: {
        const length = keystroke.length || 0;
        if (keystroke.position <= text.length) {
          text =
            text.substring(0, keystroke.position) +
            (keystroke.value || '') +
            text.substring(keystroke.position + length);
        }
        break;
      }
    }
  }

  return text;
}
