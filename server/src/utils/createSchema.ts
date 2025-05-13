import { buildSchema } from 'type-graphql';
import { AuthResolver } from '../resolvers/auth/auth';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation/candidateInvitation';
import { InterviewResolver } from '../resolvers/interview/interview';
import { InterviewTemplateResolver } from '../resolvers/interviewTemplate/interviewTemplate';
import { KeystrokeResolver } from '../resolvers/keystroke/keystroke';
import { PasswordResolver } from '../resolvers/password/password';
import { QuestionResolver } from '../resolvers/question/question';
import { RegistrationResolver } from '../resolvers/registration/registration';
import { TagResolver } from '../resolvers/tag/tag';
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
      TagResolver,
      QuestionResolver,
      InterviewResolver,
    ],
    validate: false,
  });
