import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { COOKIE_NAME } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { AuthResponse } from './user';

@InputType()
export class AuthInput {
  @Field() email: string;
  @Field() password: string;
}

@Resolver()
export class AuthResolver {
  @Query(() => AuthResponse, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<AuthResponse> {
    if (!req.session.userId) {
      return {
        errors: [
          {
            field: 'general',
            message: 'not authenticated',
          },
        ],
      };
    }
    const user = await User.findOne({ where: { id: req.session.userId } });

    if (!user) {
      return {
        errors: [
          {
            field: 'general',
            message: 'user not found',
          },
        ],
      };
    }
    return {
      user,
    };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Arg('input', () => AuthInput) input: AuthInput,
    @Ctx() { req }: MyContext,
  ): Promise<AuthResponse> {
    const user = await User.findOne({ where: [{ email: input.email }] });
    if (!user) {
      return {
        errors: [
          {
            field: 'email',
            message: 'email does not exist',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, input.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    // store user id session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      }),
    );
  }
}
