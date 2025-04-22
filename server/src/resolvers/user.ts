import { Field, ObjectType, Resolver } from 'type-graphql';
import { User } from '../entities/User';

@ObjectType()
export class FieldError {
  @Field() field: string;
  @Field() message: string;
}

@ObjectType()
export class AuthResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver(User)
export class UserResolver {
  // This class can be used for field resolvers specific to the User object if needed in the future.
}
