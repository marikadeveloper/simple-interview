import { Field, InputType } from 'type-graphql';

@InputType()
export class ChangePasswordInput {
  @Field() oldPassword: string;
  @Field() newPassword: string;
}
