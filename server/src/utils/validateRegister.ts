import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';
import { RegisterInput } from '../resolvers/registration/registration-types';
import { errorStrings } from './errorStrings';

export const validateRegister = async (
  input: RegisterInput,
): Promise<string | null> => {
  if (!input.email.includes('@')) {
    return errorStrings.user.invalidEmail;
  }

  if (input.password.length < PASSWORD_MIN_LENGTH) {
    return errorStrings.user.passwordTooShort;
  }

  if (input.fullName.length < FULL_NAME_MIN_LENGTH) {
    return errorStrings.user.fullNameTooShort;
  }

  return null;
};
