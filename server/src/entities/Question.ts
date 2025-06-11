import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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

  @Field(() => QuestionBank, { nullable: true })
  @ManyToOne(() => QuestionBank, (questionBank) => questionBank.questions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  questionBank?: QuestionBank;

  @ManyToMany(
    () => InterviewTemplate,
    (interviewTemplate) => interviewTemplate.questions,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable()
  @Field(() => [InterviewTemplate], { nullable: true })
  interviewTemplates?: InterviewTemplate[];
}
