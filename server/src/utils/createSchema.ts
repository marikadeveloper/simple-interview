import { buildSchema } from 'type-graphql';
import { AuthResolver } from '../resolvers/auth/auth';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation/candidateInvitation';
import { InterviewTemplateResolver } from '../resolvers/interviewTemplate/interviewTemplate';
import { KeystrokeResolver } from '../resolvers/keystroke/keystroke';
import { PasswordResolver } from '../resolvers/password/password';
import { RegistrationResolver } from '../resolvers/registration/registration';
import { UserResolver } from '../resolvers/user/user';

export const createSchema = () =>
  buildSchema({
    resolvers: [
      UserResolver,
      CandidateInvitationResolver,
      AuthResolver,
      PasswordResolver,
      RegistrationResolver,
      KeystrokeResolver,
      InterviewTemplateResolver,
    ],
    validate: false,
  });
