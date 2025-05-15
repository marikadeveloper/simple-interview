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
