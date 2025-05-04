import { Field, InputType } from 'type-graphql';

@InputType()
export class InterviewTemplateInput {
  @Field(() => String) name!: string;
  @Field(() => String) description!: string;
}
