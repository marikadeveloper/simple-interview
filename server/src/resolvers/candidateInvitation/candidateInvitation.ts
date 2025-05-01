import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { CandidateInvitation } from '../../entities/CandidateInvitation';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { sendEmail } from '../../utils/sendEmail';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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
        <a href="${CLIENT_URL}/candidate-signup?email=${email}">sign up</a>
        <p>Thank you!</p>
        `,
      );

      return true;
    } catch (error) {
      console.error('Error creating candidate invitation:', error);
      return false;
    }
  }

  @Query(() => [CandidateInvitation])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getCandidateInvitations(
    @Arg('used', { nullable: true }) used: boolean,
  ): Promise<CandidateInvitation[]> {
    try {
      const invitations = await CandidateInvitation.find({
        where: { used: Boolean(used) },
        order: { createdAt: 'DESC' },
      });
      return invitations;
    } catch (error) {
      console.error('Error fetching candidate invitations:', error);
      return [];
    }
  }
}
