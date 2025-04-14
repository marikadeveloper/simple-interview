import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { dataSource } from '../index';
import { MyContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';

@InputType()
export class AuthInput {
  @Field() email: string;
  @Field() password: string;
}

@InputType()
export class ChangePasswordInput {
  @Field() token: string;
  @Field() newPassword: string;
}

@ObjectType()
class FieldError {
  @Field() field: string;
  @Field() message: string;
}

@ObjectType()
class AuthResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return Promise.resolve(null);
    }

    return User.findOne({ where: { id: req.session.userId } });
  }

  @Mutation(() => AuthResponse)
  async changePassword(
    @Arg('input') input: ChangePasswordInput,
    @Ctx() { redis, req }: MyContext,
  ): Promise<AuthResponse> {
    if (input.newPassword.length <= 8) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Length must be greater than 8',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + input.token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token expired or invalid',
          },
        ],
      };
    }

    const user = await User.findOneBy({ id: parseInt(userId) });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exists',
          },
        ],
      };
    }

    // update password
    user.password = await argon2.hash(input.newPassword);
    await user.save();

    // delete token
    await redis.del(key);
    // log in user
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext,
  ): Promise<boolean> {
    // send email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email not found
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'EX',
      1000 * 60 * 60 * 24 * 3, // 3 days
    );
    const anchorTag = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;
    await sendEmail(
      email,
      'Reset Password',
      `
      <h1>Click the link below to reset your password</h1>
      <div>${anchorTag}</div>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you!</p>
      `,
    );
    return true;
  }

  @Mutation(() => AuthResponse)
  async register(
    @Arg('input', () => AuthInput) input: AuthInput,
    @Ctx() { req }: MyContext,
  ): Promise<AuthResponse> {
    const errors = validateRegister(input);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(input.password);
    let user;
    try {
      const result = await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: input.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute();

      user = result.raw[0];
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'email',
              message: 'email already taken',
            },
          ],
        };
      }
      console.error(err.message);
    }

    // store user id session
    // This will set a cookie on the user
    // and keep them logged in
    req.session.userId = user.id;

    return { user };
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
