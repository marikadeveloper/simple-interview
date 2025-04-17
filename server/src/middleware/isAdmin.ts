import { MiddlewareFn } from 'type-graphql';
import { User, UserRole } from '../entities/User';
import { MyContext } from '../types';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const userId = context.req.session.userId;

  if (!userId) {
    throw new Error('not authenticated');
  }

  const admin = await User.findOne({
    where: { id: userId, role: UserRole.ADMIN },
  });

  if (!admin) {
    throw new Error('not authorized');
  }

  return next();
};
