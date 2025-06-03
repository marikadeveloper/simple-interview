import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { User, UserRole } from '../../entities/User';
import { isAdmin } from '../../middleware/isAdmin';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { isValidRegistrationData } from '../../middleware/isValidRegistrationData';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { generatePassword } from '../../utils/generatePassword';
import { handleRegistrationErrors } from '../../utils/handleRegistrationErrors';
import { sendEmail } from '../../utils/sendEmail';
import { AdminRegisterInput, PreRegisterInput } from './registration-types';

@Resolver()
export class RegistrationResolver {
  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isValidRegistrationData)
  async adminRegister(
    @Arg('input', () => AdminRegisterInput) input: AdminRegisterInput,
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
        isActive: true,
      }).save();

      // Store user id session
      req.session.userId = user.id;

      return user;
    } catch (err) {
      return handleRegistrationErrors(err);
    }
  }

  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  @UseMiddleware(isValidRegistrationData)
  async candidateRegister(
    @Arg('input', () => PreRegisterInput) input: PreRegisterInput,
  ): Promise<User | null> {
    const randomPassword = generatePassword();
    const hashedPassword = await argon2.hash(randomPassword);

    try {
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: UserRole.CANDIDATE,
        isActive: false, // Candidates are inactive by default
      }).save();

      // send email to candidate with random password
      const anchorTag = `<a href="${process.env.CLIENT_URL}/login">Login</a>`;
      await sendEmail(
        input.email,
        'Welcome to Simple Interview',
        `
        <p>Hi ${input.fullName},</p>
        <p>Thank you for registering with Simple Interview. Your account has been created with the following credentials:</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        <p>Please change your password after logging in for the first time.</p>
        <div>${anchorTag}</div>
        <p>Thank you for joining us!</p>
        `,
      );

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
    @Arg('input', () => PreRegisterInput) input: PreRegisterInput,
  ): Promise<User | null> {
    const randomPassword = generatePassword();
    const hashedPassword = await argon2.hash(randomPassword);

    try {
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: UserRole.INTERVIEWER,
        isActive: false,
      }).save();

      // send email to interviewer
      const anchorTag = `<a href="${process.env.CLIENT_URL}/login">Login</a>`;
      await sendEmail(
        input.email,
        'Welcome to Simple Interview',
        `
        <p>Hi ${input.fullName},</p>
        <p>Thank you for registering with Simple Interview. Your account has been created with the following credentials:</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        <p>Please change your password after logging in for the first time.</p>
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
