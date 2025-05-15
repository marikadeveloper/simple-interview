import { MiddlewareFn } from 'type-graphql';
import { User, UserRole } from '../entities/User';
import { MyContext } from '../types';
import { errorStrings } from '../utils/errorStrings';

export const isAdminOrInterviewer: MiddlewareFn<MyContext> = async (
  { context },
  next,
) => {
  const userId = context.req.session.userId;

  const user = await User.findOne({
    where: { id: userId },
  });

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.INTERVIEWER)
  ) {
    throw new Error(errorStrings.user.notAuthorized);
  }

  return next();
};
