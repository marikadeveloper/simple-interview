import { generatePassword as gen } from 'secure-password-utilities';

export const generatePassword = (length: number = 12): string => {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  return gen(length);
};
