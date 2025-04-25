import { Field, ObjectType } from 'type-graphql';
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
