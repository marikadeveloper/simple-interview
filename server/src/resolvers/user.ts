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
  UseMiddleware,
} from 'type-graphql';
import { v4 } from 'uuid';
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  PASSWORD_MIN_LENGTH,
} from '../constants';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { User, UserRole } from '../entities/User';
import { dataSource } from '../index';
import { isAdmin } from '../middleware/isAdmin';
import { isAuth } from '../middleware/isAuth';
import { isValidRegistrationData } from '../middleware/isValidRegistrationData';
import { MyContext } from '../types';
import { handleRegistrationErrors } from '../utils/handleRegistrationErrors';
import { sendEmail } from '../utils/sendEmail';

@InputType()
export class AuthInput {
  @Field() email: string;
  @Field() password: string;
}

@InputType()
export class RegisterInput {
  @Field() email: string;
  @Field() password: string;
  @Field() fullName: string;
}

@InputType()
export class ChangePasswordInput {
  @Field() token: string;
  @Field() newPassword: string;
}

@ObjectType()
export class FieldError {
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

  @Mutation(() => AuthResponse)
  @UseMiddleware(isValidRegistrationData)
  async adminRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
    @Ctx() { req }: MyContext,
  ) {
    // check if there is already an admin
    const adminCount = await User.count({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (adminCount > 0) {
      return {
        errors: [
          {
            field: 'role',
            message: 'only one admin is allowed',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(input.password);

    try {
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: UserRole.ADMIN,
      }).save();

      // Store user id session
      req.session.userId = user.id;

      return { user };
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }

  @Mutation(() => AuthResponse)
  @UseMiddleware(isValidRegistrationData)
  async candidateRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<AuthResponse> {
    const hashedPassword = await argon2.hash(input.password);

    try {
      const user = await dataSource.transaction(
        async (transactionalEntityManager) => {
          const candidateInvitation = await transactionalEntityManager.findOne(
            CandidateInvitation,
            {
              where: { email: input.email, used: false },
            },
          );

          if (!candidateInvitation) {
            throw new Error('invalid invitation');
          }

          candidateInvitation.used = true;
          await transactionalEntityManager.save(candidateInvitation);

          return transactionalEntityManager.save(User, {
            email: input.email,
            password: hashedPassword,
            fullName: input.fullName,
            role: UserRole.CANDIDATE,
          });
        },
      );

      // Store user id session
      req.session.userId = user.id;

      return { user };
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }

  @Mutation(() => AuthResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  @UseMiddleware(isValidRegistrationData)
  async interviewerRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
  ): Promise<AuthResponse> {
    const hashedPassword = await argon2.hash(input.password);

    try {
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: UserRole.INTERVIEWER,
      }).save();

      // send email to interviewer
      const anchorTag = `<a href="${process.env.CLIENT_URL}/login">Login</a>`;
      await sendEmail(
        input.email,
        'Welcome to Simple Interview',
        `
        <p>Hi ${input.fullName},</p>
        <p>A Simple Interview account has been set up for you. Click the link below to login:</p>
        <div>${anchorTag}</div>
        <p>Thank you for joining us!</p>
        `,
      );

      return { user };
    } catch (err) {
      return handleRegistrationErrors(err);
    }
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
