import { KeystrokeInput, KeystrokeType } from '../generated/graphql';

export class KeystrokeRecorder {
  private keystrokes: KeystrokeInput[] = [];
  private startTime: number;
  private isRecording: boolean = false;
  private batchSize: number;
  private onBatchComplete?: (batch: KeystrokeInput[]) => void;

  constructor(
    batchSize: number = 20,
    onBatchComplete?: (batch: KeystrokeInput[]) => void,
  ) {
    this.startTime = Date.now();
    this.batchSize = batchSize;
    this.onBatchComplete = onBatchComplete;
  }

  public startRecording(): void {
    this.isRecording = true;
    this.startTime = Date.now();
    this.keystrokes = [];
  }

  public stopRecording(): KeystrokeInput[] {
    this.isRecording = false;
    const result = [...this.keystrokes];
    this.keystrokes = [];
    return result;
  }

  public insertText(position: number, text: string): void {
    if (!this.isRecording) return;

    this.addKeystroke({
      type: KeystrokeType.Insert,
      position,
      value: text,
      relativeTimestamp: this.getCurrentRelativeTime(),
    });
  }

  public deleteText(position: number, length: number): void {
    if (!this.isRecording) return;

    this.addKeystroke({
      type: KeystrokeType.Delete,
      position,
      length,
      relativeTimestamp: this.getCurrentRelativeTime(),
    });
  }

  public replaceText(position: number, length: number, text: string): void {
    if (!this.isRecording) return;

    this.addKeystroke({
      type: KeystrokeType.Replace,
      position,
      length,
      value: text,
      relativeTimestamp: this.getCurrentRelativeTime(),
    });
  }

  private addKeystroke(keystroke: KeystrokeInput): void {
    this.keystrokes.push(keystroke);

    // If we hit the batch size threshold and have a callback, process the batch
    if (this.onBatchComplete && this.keystrokes.length >= this.batchSize) {
      const batch = [...this.keystrokes];
      this.keystrokes = [];
      this.onBatchComplete(batch);
    }
  }

  private getCurrentRelativeTime(): number {
    return Date.now() - this.startTime;
  }

  public getAllKeystrokes(): KeystrokeInput[] {
    return [...this.keystrokes];
  }
}

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
        const length = keystroke.length || 0;
        if (keystroke.position < text.length) {
          text =
            text.substring(0, keystroke.position) +
            text.substring(keystroke.position + length);
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
