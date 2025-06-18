import { Field, InputType } from 'type-graphql';

@InputType()
export class CandidatesFilters {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  fullName?: string;
}
