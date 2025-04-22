import { MiddlewareFn } from 'type-graphql';
import { User, UserRole } from '../entities/User';
import { MyContext } from '../types';

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
    return {
      errors: [
        {
          field: 'general',
          message: 'not authorized',
        },
      ],
    };
  }

  return next();
};
