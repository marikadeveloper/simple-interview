import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class InterviewTemplateInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;

  @Field(() => [Int], { nullable: true })
  tagsIds?: number[];
}

@InputType()
export class AddQuestionsFromQuestionBankInput {
  @Field(() => Int)
  interviewTemplateId!: number;

  @Field(() => [Int])
  questionIds!: number[];
}
