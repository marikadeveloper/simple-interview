import { buildSchema } from 'type-graphql';
import { AuthResolver } from '../resolvers/auth/auth';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation/candidateInvitation';
import { KeystrokeResolver } from '../resolvers/keystroke/keystroke';
import { PasswordResolver } from '../resolvers/password/password';
import { RegistrationResolver } from '../resolvers/registration/registration';

export const createSchema = () =>
  buildSchema({
    resolvers: [
      CandidateInvitationResolver,
      AuthResolver,
      PasswordResolver,
      RegistrationResolver,
      KeystrokeResolver,
    ],
    validate: false,
  });
