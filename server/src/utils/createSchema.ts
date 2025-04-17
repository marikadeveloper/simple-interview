import { buildSchema } from 'type-graphql';
import { CandidateInvitationResolver } from '../resolvers/candidateInvitation';
import { UserResolver } from '../resolvers/user';

export const createSchema = () =>
  buildSchema({
    resolvers: [UserResolver, CandidateInvitationResolver],
    validate: false,
  });
