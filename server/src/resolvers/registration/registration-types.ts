import { Field, InputType } from 'type-graphql';
import { UserRole } from '../../entities/User';

@InputType()
export class AdminRegisterInput {
  @Field() email: string;
  @Field() password: string;
  @Field() fullName: string;
}

@InputType()
export class PreRegisterInput {
  @Field() email: string;
  @Field() fullName: string;
  @Field() role: UserRole;
}
