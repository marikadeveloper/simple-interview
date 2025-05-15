import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class InterviewInput {
  @Field(() => Int)
  interviewTemplateId: number;

  @Field(() => Int)
  candidateId: number;

  @Field(() => String)
  deadline: string;
}
