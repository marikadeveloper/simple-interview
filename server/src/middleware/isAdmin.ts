import { MiddlewareFn } from 'type-graphql';
import { dataSource } from '../index';
import { MyContext } from '../types';

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const user = context.req.session.userId;

  if (!user) {
    throw new Error('not authenticated');
  }

  const userRole = await dataSource
    .getRepository('User')
    .findOne({ where: { id: user } });

  if (!userRole || userRole.role !== 'ADMIN') {
    throw new Error('not authorized');
  }

  return next();
};
