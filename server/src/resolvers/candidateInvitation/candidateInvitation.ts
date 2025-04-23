import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { CandidateInvitation } from '../../entities/CandidateInvitation';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { sendEmail } from '../../utils/sendEmail';

const CLIENT_URL = process.env.CLIENT_URL;

@Resolver(CandidateInvitation)
export class CandidateInvitationResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createCandidateInvitation(@Arg('email') email: string) {
    try {
      const candidateInvitation = CandidateInvitation.create({
        email,
      });
      await candidateInvitation.save();

      // Send email to the candidate
      await sendEmail(
        email,
        'Invitation to Interview',
        `
        <p>Hi!</p>
        <p>You have been invited to an interview. Please click the link and create an account:</p>
        <a href="${CLIENT_URL}/sign-up?email=${email}">sign up</a>
        <p>Thank you!</p>
        `,
      );

      return true;
    } catch (error) {
      console.error('Error creating candidate invitation:', error);
      return false;
    }
  }
}
