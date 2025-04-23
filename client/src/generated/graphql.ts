// This is an addition to your existing generated GraphQL types file
// You should regenerate this file properly with your codegen after implementing the server changes

export enum KeystrokeType {
  INSERT = 'insert',
  DELETE = 'delete',
  REPLACE = 'replace',
}

export interface Keystroke {
  id: number;
  type: KeystrokeType;
  value?: string | null;
  position: number;
  length?: number | null;
  timestamp: string;
  relativeTimestamp: number;
}

export interface KeystrokeInput {
  type: KeystrokeType;
  value?: string | null;
  position: number;
  length?: number | null;
  relativeTimestamp: number;
}

export interface SaveKeystrokesInput {
  answerId: number;
  keystrokes: KeystrokeInput[];
}
