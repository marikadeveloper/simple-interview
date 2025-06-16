import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './Question';

@ObjectType()
@Entity()
export class QuestionBank extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => String)
  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => Question, (question) => question.questionBank)
  @Field(() => [Question], { nullable: true })
  questions: Question[];
}
