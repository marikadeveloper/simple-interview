import { Field, InputType, ObjectType } from 'type-graphql';
import { User, UserRole } from '../../entities/User';
import { FieldError } from '../resolvers-types';

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

@ObjectType()
export class UserSingleResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class UserMultipleResponse {
  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
