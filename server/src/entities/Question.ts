import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InterviewTemplate } from './InterviewTemplate';
import { QuestionBank } from './QuestionBank';

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  title!: string;

  @Field(() => String)
  @Column()
  description!: string;

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @Field(() => Int)
  @Column()
  sortOrder: number;

  @Field(() => InterviewTemplate, { nullable: true })
  @ManyToOne(
    () => InterviewTemplate,
    (interviewTemplate) => interviewTemplate.questions,
    { onDelete: 'CASCADE', nullable: true },
  )
  interviewTemplate?: InterviewTemplate;

  @Field(() => QuestionBank, { nullable: true })
  @ManyToOne(() => QuestionBank, (questionBank) => questionBank.questions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  questionBank?: QuestionBank;
}
