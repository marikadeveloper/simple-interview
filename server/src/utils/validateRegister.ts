import { AuthInput } from '../resolvers/user';

export const validateRegister = (input: AuthInput) => {
  if (!input.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (input.password.length <= 7) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 7',
      },
    ];
  }

  return null;
};
