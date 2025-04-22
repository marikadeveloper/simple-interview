import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types';

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.userId) {
    return {
      errors: [
        {
          field: 'general',
          message: 'User not logged in',
        },
      ],
    };
  }
  return next();
};
