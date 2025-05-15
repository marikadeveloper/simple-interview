import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { COOKIE_NAME } from '../../constants';
import { User } from '../../entities/User';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { AuthInput } from './auth-types';

@Resolver()
export class AuthResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      throw new Error(errorStrings.user.notAuthenticated);
    }
    const user = await User.findOne({ where: { id: req.session.userId } });

    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }

    return user;
  }

  @Mutation(() => User)
  async login(
    @Arg('input', () => AuthInput) input: AuthInput,
    @Ctx() { req }: MyContext,
  ): Promise<User | null> {
    const user = await User.findOne({ where: [{ email: input.email }] });
    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }

    const valid = await argon2.verify(user.password, input.password);
    if (!valid) {
      throw new Error(errorStrings.user.incorrectPassword);
    }

    // store user id session
    req.session.userId = user.id;

    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      }),
    );
  }
}
