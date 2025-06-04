import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { v4 } from 'uuid';
import { FORGET_PASSWORD_PREFIX, PASSWORD_MIN_LENGTH } from '../../constants';
import { User, UserRole } from '../../entities/User';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { sendEmail } from '../../utils/sendEmail';
import {
  ChangePasswordInput,
  ForgotPasswordChangeInput,
} from './password-types';

@Resolver()
export class PasswordResolver {
  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async changePassword(
    @Arg('input') input: ChangePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<User | null> {
    if (input.newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new Error(errorStrings.user.passwordTooShort);
    }

    const userId = req.session.userId;
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }

    // check if the old password is correct
    const valid = await argon2.verify(user.password, input.oldPassword);
    if (!valid) {
      throw new Error(errorStrings.user.invalidOldPassword);
    }

    // update password
    user.password = await argon2.hash(input.newPassword);
    await user.save();

    if (
      [UserRole.CANDIDATE, UserRole.INTERVIEWER].includes(user.role) &&
      !user.isActive
    ) {
      // if the user is a candidate or interviewer, set isActive to true
      user.isActive = true;
      await user.save();
    }

    // log in user
    req.session.userId = user.id;
    return user;
  }

  @Mutation(() => Boolean)
  async forgotPasswordRequest(
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

  @Mutation(() => Boolean)
  async forgotPasswordChange(
    @Arg('input') input: ForgotPasswordChangeInput,
    @Ctx() { req, redis }: MyContext,
  ): Promise<boolean> {
    const { token, newPassword } = input;

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new Error(errorStrings.user.passwordTooShort);
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      throw new Error(errorStrings.user.tokenExpired);
    }

    const user = await User.findOneBy({ id: parseInt(userId, 10) });
    if (!user) {
      throw new Error(errorStrings.user.notFound);
    }

    // update password
    user.password = await argon2.hash(newPassword);
    await user.save();

    // delete token
    await redis.del(key);

    // log in user
    req.session.userId = user.id;
    return true;
  }
}
