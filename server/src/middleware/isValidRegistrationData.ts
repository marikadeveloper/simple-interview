import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types';
import { validateRegister } from '../utils/validateRegister';

export const isValidRegistrationData: MiddlewareFn<MyContext> = async (
  { args },
  next,
) => {
  const { input } = args;

  const errors = await validateRegister(input);

  if (errors) {
    return {
      errors,
    };
  }

  return next();
};
