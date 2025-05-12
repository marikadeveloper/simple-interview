import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { User, UserRole } from '../../entities/User';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import {
  UserMultipleResponse,
  UsersFilters,
  UserSingleResponse,
} from './user-types';

@Resolver(User)
export class UserResolver {
  @Query(() => UserMultipleResponse, {
    description:
      'Returns all users except the logged in user, if logged in as Interviewer only candidates are returned',
  })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getUsers(
    @Arg('filters', () => UsersFilters) filters: UsersFilters,
    @Ctx() { req }: MyContext,
  ): Promise<UserMultipleResponse> {
    const userId = req.session.userId;
    const user = (await User.findOne({
      where: { id: userId },
    })) as User;

    const { fullName, email, role } = filters;

    const query = User.createQueryBuilder('user')
      .where('user.id != :id', { id: req.session.userId })
      .orderBy('user.createdAt', 'DESC');

    // interviewers can only see candidates
    if (user.role === UserRole.INTERVIEWER) {
      query.andWhere('user.role = :role', { role: UserRole.CANDIDATE });
    }
    // admins can see all users
    if (user.role === UserRole.ADMIN && role) {
      query.andWhere('user.role = :role', { role });
    }

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
    return { users };
  }

  @Query(() => UserSingleResponse, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getUser(@Arg('id', () => Int) id: number): Promise<UserSingleResponse> {
    const user = await User.findOne({
      where: { id },
      relations: ['interviews'],
    });

    if (!user) {
      return {
        errors: [{ field: 'id', message: 'User not found' }],
      };
    }

    return { user };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteUser(@Arg('id', () => Int) id: number): Promise<boolean> {
    const user = await User.findOne({
      where: { id },
    });
    if (!user) {
      return false;
    }
    await User.delete({ id });
    return true;
  }
}
