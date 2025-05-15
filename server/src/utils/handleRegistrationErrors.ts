import { errorStrings } from './errorStrings';

export const handleRegistrationErrors = (err: any) => {
  if (err.code === '23505') {
    throw new Error(errorStrings.user.duplicateEmail);
  }
  throw new Error(err.message);
};
