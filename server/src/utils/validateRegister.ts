import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';
import { RegisterInput } from '../resolvers/registration.resolver';
import { FieldError } from '../resolvers/user';

export const validateRegister = async (
  input: RegisterInput,
): Promise<FieldError[] | null> => {
  if (!input.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (input.password.length < PASSWORD_MIN_LENGTH) {
    return [
      {
        field: 'password',
        message: `Length must be at least ${PASSWORD_MIN_LENGTH} characters`,
      },
    ];
  }

  if (input.fullName.length < FULL_NAME_MIN_LENGTH) {
    return [
      {
        field: 'fullName',
        message: `Length must be at least ${FULL_NAME_MIN_LENGTH} characters`,
      },
    ];
  }

  return null;
};
