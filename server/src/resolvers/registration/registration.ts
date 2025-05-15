import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { dataSource } from '../..';
import { CandidateInvitation } from '../../entities/CandidateInvitation';
import { User, UserRole } from '../../entities/User';
import { isAdmin } from '../../middleware/isAdmin';
import { isAuth } from '../../middleware/isAuth';
import { isValidRegistrationData } from '../../middleware/isValidRegistrationData';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { handleRegistrationErrors } from '../../utils/handleRegistrationErrors';
import { sendEmail } from '../../utils/sendEmail';
import { RegisterInput } from './registration-types';

@Resolver()
export class RegistrationResolver {
  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isValidRegistrationData)
  async adminRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<User | null> {
    // check if there is already an admin
    const adminCount = await User.count({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (adminCount > 0) {
      throw new Error(errorStrings.user.onlyOneAdminAllowed);
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

      return user;
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }

  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isValidRegistrationData)
  async candidateRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<User | null> {
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
            throw new Error(errorStrings.user.invalidInvitation);
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

      return user;
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }

  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  @UseMiddleware(isValidRegistrationData)
  async interviewerRegister(
    @Arg('input', () => RegisterInput) input: RegisterInput,
  ): Promise<User | null> {
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

      return user;
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }
}
