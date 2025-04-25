import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User, UserRole } from '../../entities/User';
import { isAdmin } from '../../middleware/isAdmin';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { CandidatesFilters, UsersFilters } from './user-types';

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async getUsers(
    @Arg('filters', () => UsersFilters) filters: UsersFilters,
    @Ctx() { req }: MyContext,
  ): Promise<User[]> {
    const { fullName, email, role } = filters;

    const query = User.createQueryBuilder('user')
      .where('user.id != :id', { id: req.session.userId })
      .orderBy('user.createdAt', 'DESC');

    if (fullName) {
      query.andWhere('user.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }
    if (email) {
      query.andWhere('user.email ILIKE :email', {
        email: `%${email}%`,
      });
    }
    if (role) {
      query.andWhere('user.role = :role', { role });
    }
    const users = await query.getMany();
    return users;
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getCandidates(
    @Arg('filters', () => CandidatesFilters) filters: CandidatesFilters,
    @Ctx() { req }: MyContext,
  ) {
    const { fullName, email } = filters;

    const query = User.createQueryBuilder('user')
      .where('user.id != :id', { id: req.session.userId })
      .andWhere('user.role = :role', { role: UserRole.CANDIDATE })
      .orderBy('user.createdAt', 'DESC');

    if (fullName) {
      query.andWhere('user.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }
    if (email) {
      query.andWhere('user.email ILIKE :email', {
        email: `%${email}%`,
      });
    }
    const users = await query.getMany();
    return users;
  }
}
