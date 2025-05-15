import { Field, InputType, Int } from 'type-graphql';

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
