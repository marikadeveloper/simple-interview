import { FieldError } from '../resolvers/resolvers-types';

export const handleRegistrationErrors = (
  err: any,
): { errors: FieldError[] } => {
  if (err.code === '23505') {
    return {
      errors: [
        {
          field: 'email',
          message: 'email already taken',
        },
      ],
    };
  }
  return {
    errors: [
      {
        field: 'general',
        message: err.message,
      },
    ],
  };
};
