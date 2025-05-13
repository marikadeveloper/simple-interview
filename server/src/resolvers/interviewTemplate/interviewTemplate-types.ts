import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { FieldError } from '../resolvers-types';

@InputType()
export class InterviewTemplateInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;

  @Field(() => [Int], { nullable: true })
  tagsIds?: number[];
}

@ObjectType()
export class InterviewTemplateSingleResponse {
  @Field(() => InterviewTemplate, { nullable: true })
  interviewTemplate?: InterviewTemplate;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class InterviewTemplateMultipleResponse {
  @Field(() => [InterviewTemplate], { nullable: true })
  interviewTemplates?: InterviewTemplate[];

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
