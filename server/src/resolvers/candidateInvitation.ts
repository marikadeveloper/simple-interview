import { sendEmail } from 'src/utils/sendEmail';
import { Arg, Mutation, Resolver } from 'type-graphql';
import { CandidateInvitation } from '../entities/CandidateInvitation';

const CLIENT_URL = process.env.CLIENT_URL;

@Resolver(CandidateInvitation)
export class CandidateInvitationResolver {
  @Mutation(() => Boolean)
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
        `You have been invited to an interview. Please click the link and create an account: <a href="${CLIENT_URL}/sign-up?email=${email}">sign up</a>`,
      );

      return true;
    } catch (error) {
      console.error('Error creating candidate invitation:', error);
      return false;
    }
  }
}
