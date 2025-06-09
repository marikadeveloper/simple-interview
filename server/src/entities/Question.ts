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

  @Field(() => InterviewTemplate)
  @ManyToOne(
    () => InterviewTemplate,
    (interviewTemplate) => interviewTemplate.questions,
    { onDelete: 'CASCADE' },
  )
  interviewTemplate!: InterviewTemplate;
}
