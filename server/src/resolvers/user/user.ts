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
import { errorStrings } from '../../utils/errorStrings';

@Resolver(User)
export class UserResolver {
  @Query(() => [User], {
    description:
      'Returns all users except the logged in user, if logged in as Interviewer only candidates are returned',
    nullable: true,
  })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getUsers(
    @Ctx() { req }: MyContext,
    @Arg('filter', () => String, { nullable: true }) filter?: string,
  ): Promise<User[] | null> {
    const userId = req.session.userId;
    const user = (await User.findOne({
      where: { id: userId },
    })) as User;

    const query = User.createQueryBuilder('user')
      .where('user.id != :id', { id: req.session.userId })
      .orderBy('user.createdAt', 'DESC');

    // interviewers can only see candidates
    if (user.role === UserRole.INTERVIEWER) {
      query.andWhere('user.role = :role', { role: UserRole.CANDIDATE });
    }

    if (filter && filter.trim() !== '') {
      const filterLower = `%${filter.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(user.fullName) LIKE :filter OR LOWER(user.email) LIKE :filter)',
        { filter: filterLower },
      );
    }

    const users = await query.getMany();
    return users;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getUser(@Arg('id', () => Int) id: number): Promise<User | null> {
    const user = await User.findOne({
      where: { id },
      relations: ['interviews'],
    });

    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }

    return user;
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

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateUserName(
    @Arg('fullName', () => String) fullName: string,
    @Ctx() { req }: MyContext,
  ): Promise<User> {
    const userId = req.session.userId;
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }
    user.fullName = fullName;
    await user.save();
    return user;
  }
}
