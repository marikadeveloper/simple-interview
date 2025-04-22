import { MiddlewareFn } from 'type-graphql';
import { User, UserRole } from '../entities/User';
import { MyContext } from '../types';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const userId = context.req.session.userId;

  const admin = await User.findOne({
    where: { id: userId, role: UserRole.ADMIN },
  });

  if (!admin) {
    return {
      errors: [
        {
          field: 'general',
          message: 'User is not an admin',
        },
      ],
    };
  }

  return next();
};
