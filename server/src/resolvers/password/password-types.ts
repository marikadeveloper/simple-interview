import { Field, InputType } from 'type-graphql';

@InputType()
export class ChangePasswordInput {
  @Field() oldPassword: string;
  @Field() newPassword: string;
}

@InputType()
export class ForgotPasswordChangeInput {
  @Field() token: string;
  @Field() newPassword: string;
}
