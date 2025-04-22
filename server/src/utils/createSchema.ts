import { buildSchema } from 'type-graphql';
import { AuthResolver } from '../resolvers/auth.resolver';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation.resolver';
import { PasswordResolver } from '../resolvers/password.resolver';
import { RegistrationResolver } from '../resolvers/registration.resolver';

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
