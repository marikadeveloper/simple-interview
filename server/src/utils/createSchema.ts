import { buildSchema } from 'type-graphql';
import { AuthResolver } from '../resolvers/auth';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation';
import { PasswordResolver } from '../resolvers/password';
import { RegistrationResolver } from '../resolvers/registration';

export const createSchema = () =>
  buildSchema({
    resolvers: [
      CandidateInvitationResolver,
      AuthResolver,
      PasswordResolver,
      RegistrationResolver,
    ],
    validate: false,
  });
