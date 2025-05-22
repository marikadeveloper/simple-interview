import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class CreateAnswerInput {
  @Field(() => Int)
  questionId: number;

  @Field(() => Int)
  interviewId: number;

  @Field(() => String)
  text: string;

  @Field(() => String, { defaultValue: 'plaintext' })
  language: string;
}
