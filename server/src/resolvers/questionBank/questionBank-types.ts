import { Field, InputType } from 'type-graphql';

@InputType()
export class QuestionBankInput {
  @Field(() => String)
  name!: string;
}
