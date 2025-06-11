import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class QuestionCreateInput {
  @Field(() => String) title: string;
  @Field(() => String) description: string;
  @Field(() => Int, { nullable: true }) questionBankId?: number;
  @Field(() => Int, { nullable: true }) interviewTemplateId?: number;
}

@InputType()
export class QuestionUpdateInput {
  @Field(() => String) title: string;
  @Field(() => String) description: string;
}
