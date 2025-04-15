import { FieldError } from '../resolvers/user';

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
  console.error(err.message);
  return {
    errors: [
      {
        field: 'general',
        message: 'An unexpected error occurred',
      },
    ],
  };
};
