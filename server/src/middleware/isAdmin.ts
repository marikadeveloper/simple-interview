import { MiddlewareFn } from 'type-graphql';
import { User, UserRole } from '../entities/User';
import { MyContext } from '../types';
import { errorStrings } from '../utils/errorStrings';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const userId = context.req.session.userId;

  const admin = await User.findOne({
    where: { id: userId, role: UserRole.ADMIN },
  });

  if (!admin) {
    throw new Error(errorStrings.user.notAuthorized);
  }

  return next();
};
