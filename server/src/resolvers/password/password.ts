import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { v4 } from 'uuid';
import { FORGET_PASSWORD_PREFIX, PASSWORD_MIN_LENGTH } from '../../constants';
import { User } from '../../entities/User';
import { MyContext } from '../../types';
import { sendEmail } from '../../utils/sendEmail';
import { AuthResponse } from '../resolvers-types';
import { ChangePasswordInput } from './password-types';

@Resolver()
export class PasswordResolver {
  @Mutation(() => AuthResponse)
  async changePassword(
    @Arg('input') input: ChangePasswordInput,
    @Ctx() { redis, req }: MyContext,
  ): Promise<AuthResponse> {
    if (input.newPassword.length < PASSWORD_MIN_LENGTH) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: `Length must be at least ${PASSWORD_MIN_LENGTH} characters`,
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
}
