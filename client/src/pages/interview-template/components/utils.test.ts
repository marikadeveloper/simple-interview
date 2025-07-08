import type { QuestionFragment } from '@/generated/graphql';
import { getQuestionData, isQuestionData } from './utils';

describe('interview-template/components/utils', () => {
  const question: QuestionFragment = {
    __typename: 'Question',
    id: 42,
    title: 'Test Question',
    description: 'A test question',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    questionBank: null,
  };

  it('getQuestionData returns correct data object', () => {
    const data = getQuestionData(question);
    expect(data.questionId).toBe(42);
    // Symbol property check
    const symbolKey = Object.getOwnPropertySymbols(data)[0];
    expect(symbolKey.description).toBe('question');
    expect((data as any)[symbolKey]).toBe(true);
  });

  it('isQuestionData returns true for valid data', () => {
    const data = getQuestionData(question);
    expect(isQuestionData(data)).toBe(true);
  });

  it('isQuestionData returns false for missing symbol', () => {
    const fake = { questionId: 42 };
    expect(isQuestionData(fake)).toBe(false);
  });

  it('isQuestionData returns false for wrong symbol value', () => {
    const data = getQuestionData(question);
    const symbolKey = Object.getOwnPropertySymbols(data)[0];
    const tampered = { ...data, [symbolKey]: false };
    expect(isQuestionData(tampered)).toBe(false);
  });
});
