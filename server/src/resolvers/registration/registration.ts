import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { dataSource } from '../..';
import { CandidateInvitation } from '../../entities/CandidateInvitation';
import { User, UserRole } from '../../entities/User';
import { isAdmin } from '../../middleware/isAdmin';
import { isAuth } from '../../middleware/isAuth';
import { isValidRegistrationData } from '../../middleware/isValidRegistrationData';
import { MyContext } from '../../types';
import { handleRegistrationErrors } from '../../utils/handleRegistrationErrors';
import { sendEmail } from '../../utils/sendEmail';
import { AuthResponse } from '../resolvers-types';
import { RegisterInput } from './registration-types';

@Resolver()
export class RegistrationResolver {
  @Mutation(() => AuthResponse)
  @UseMiddleware(isValidRegistrationData)
  async adminRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<AuthResponse> {
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
}
