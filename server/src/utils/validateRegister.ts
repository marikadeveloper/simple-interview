import { FULL_NAME_MIN_LENGTH } from '../constants';
import { PreRegisterInput } from '../resolvers/registration/registration-types';
import { errorStrings } from './errorStrings';

export const validateRegister = async (
  input: PreRegisterInput,
): Promise<string | null> => {
  if (!input.email.includes('@')) {
    return errorStrings.user.invalidEmail;
  }

  if (input.fullName.length < FULL_NAME_MIN_LENGTH) {
    return errorStrings.user.fullNameTooShort;
  }

  return null;
};
