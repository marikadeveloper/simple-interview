import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Question } from '../../entities/Question';
import { FieldError } from '../resolvers-types';

@InputType()
export class QuestionInput {
  @Field(() => String)
  title: string;
  @Field(() => String)
  description: string;
}

@InputType() // New InputType for updating sort order
export class UpdateQuestionSortOrderInput {
  @Field(() => Int)
  questionId: number;

  @Field(() => Int)
  newSortOrder: number; // The new 0-based index for the question
}

@ObjectType()
export class QuestionSingleResponse {
  @Field(() => Question, { nullable: true })
  question?: Question;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class QuestionMultipleResponse {
  @Field(() => [Question], { nullable: true })
  questions?: Question[];

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
