import { Field, ObjectType } from 'type-graphql';
import { Tag } from '../../entities/Tag';
import { FieldError } from '../resolvers-types';

@ObjectType()
export class TagSingleResponse {
  @Field(() => Tag, { nullable: true })
  tag?: Tag;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class TagMultipleResponse {
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
