import { Field, InputType } from 'type-graphql';
import { UserRole } from '../../entities/User';

@InputType()
export class UsersFilters {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field(() => UserRole, {
    nullable: true,
    description:
      "If logged in as Interviewer, this field will always have value 'candidate'",
  })
  role?: UserRole;
}

@InputType()
export class CandidatesFilters {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  fullName?: string;
}
