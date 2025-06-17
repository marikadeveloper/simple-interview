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

@InputType()
export class KeystrokeInput {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  snapshot: string;

  @Field(() => Int)
  relativeTimestamp!: number;
}

@InputType()
export class SaveKeystrokesInput {
  @Field(() => Int)
  answerId!: number;

  @Field(() => [KeystrokeInput])
  keystrokes!: KeystrokeInput[];
}
