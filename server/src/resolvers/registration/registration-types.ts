import { Field, InputType } from 'type-graphql';

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
}
