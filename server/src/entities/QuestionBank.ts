import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InterviewTemplateQuestionBank } from './InterviewTemplateQuestionBank';
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

  @OneToMany(() => Question, (question) => question.interviewTemplate)
  @Field(() => [Question])
  questions: Question[];

  @OneToMany(
    () => InterviewTemplateQuestionBank,
    (tplQuestionBank) => tplQuestionBank.questionBank,
  )
  interviewTemplateQuestionBanks: InterviewTemplateQuestionBank[];
}
