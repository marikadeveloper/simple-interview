import { Field, ObjectType } from 'type-graphql';
import { Interview } from '../../entities/Interview';
import { FieldError } from '../resolvers-types';

@ObjectType()
export class InterviewSingleResponse {
  @Field(() => Interview, { nullable: true })
  interview?: Interview;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class InterviewMultipleResponse {
  @Field(() => [Interview], { nullable: true })
  interviews?: Interview[];

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
