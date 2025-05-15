import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';

export const errorStrings = {
  user: {
    notAuthenticated: 'not authenticated',
    notFound: 'user not found',
    incorrectPassword: 'incorrect password',
    notAuthorized: 'not authorized',
    invalidEmail: 'invalid email',
    passwordTooShort: `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    fullNameTooShort: `full name must be at least ${FULL_NAME_MIN_LENGTH} characters`,
  },
};
