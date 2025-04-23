import { Field, InputType, Int } from 'type-graphql';
import { KeystrokeType } from '../../entities/Keystroke';

@InputType()
export class KeystrokeInput {
  @Field(() => String)
  type!: KeystrokeType;

  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => Int)
  position!: number;

  @Field(() => Int, { nullable: true })
  length?: number;

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
