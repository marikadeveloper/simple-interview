import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types';
import { errorStrings } from '../utils/errorStrings';

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error(errorStrings.user.notAuthenticated);
  }
  return next();
};
