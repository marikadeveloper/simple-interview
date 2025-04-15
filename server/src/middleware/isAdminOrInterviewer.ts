import { MiddlewareFn } from 'type-graphql';
import { dataSource } from '../index';
import { MyContext } from '../types';

export const isAdminOrInterviewer: MiddlewareFn<MyContext> = async (
  { context },
  next,
) => {
  const user = context.req.session.userId;

  if (!user) {
    throw new Error('not authenticated');
  }

  const userRole = await dataSource
    .getRepository('User')
    .findOne({ where: { id: user } });

  if (
    !userRole ||
    (userRole.role !== 'ADMIN' && userRole.role !== 'INTERVIEWER')
  ) {
    throw new Error('not authorized');
  }

  return next();
};
