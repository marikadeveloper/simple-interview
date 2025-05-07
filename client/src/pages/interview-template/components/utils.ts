import { QuestionFragment } from '@/generated/graphql';

const questionDataKey = Symbol('question');

export type TQuestionData = {
  [questionDataKey]: true;
  questionId: QuestionFragment['id'];
};

export function getQuestionData(question: QuestionFragment): TQuestionData {
  return { [questionDataKey]: true, questionId: question.id };
}

export function isQuestionData(
  data: Record<string | symbol, unknown>,
): data is TQuestionData {
  return data[questionDataKey] === true;
}
