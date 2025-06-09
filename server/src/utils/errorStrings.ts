import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';

export const errorStrings = {
  date: {
    invalidFormat: 'invalid date format',
    mustBeInTheFuture: 'date must be in the future',
  },
  user: {
    notAuthenticated: 'not authenticated',
    notFound: 'user not found',
    incorrectPassword: 'incorrect password',
    notAuthorized: 'not authorized',
    invalidEmail: 'invalid email',
    passwordTooShort: `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    fullNameTooShort: `full name must be at least ${FULL_NAME_MIN_LENGTH} characters`,
    notCandidate: 'user is not a candidate',
    tokenExpired: 'token expired or invalid',
    onlyOneAdminAllowed: 'only one admin user allowed',
    duplicateEmail: 'email already taken',
    invalidInvitation: 'invalid invitation',
    invalidOldPassword: 'invalid old password',
  },
  interviewTemplate: {
    notFound: 'interview template not found',
  },
  interview: {
    notFound: 'interview not found',
    canNotDelete:
      'you can only delete interviews that are in the PENDING status',
    canNotUpdate:
      'you can only update interviews that are in the PENDING status',
    canNotEvaluate: 'you can only evaluate interviews that are completed',
    noQuestions:
      'interview template must have either questions or a question bank',
  },
  question: {
    notFound: 'question not found',
  },
  tag: {
    emptyText: 'Tag cannot be empty',
    duplicate: 'Tag already exists',
  },
  questionBank: {
    notFound: 'question bank not found',
  },
};
