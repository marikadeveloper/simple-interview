import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types';
import { validateRegister } from '../utils/validateRegister';

export const isValidRegistrationData: MiddlewareFn<MyContext> = async (
  { args },
  next,
) => {
  const { input } = args;

  const error = await validateRegister(input);

  if (error) {
    throw new Error(error);
  }

  return next();
};
