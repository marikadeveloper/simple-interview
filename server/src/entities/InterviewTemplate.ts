import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Interview } from './Interview';
import { InterviewTemplateQuestionBank } from './InterviewTemplateQuestionBank';
import { Question } from './Question';
import { Tag } from './Tag';

@ObjectType()
@Entity()
export class InterviewTemplate extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => String)
  @Column()
  description!: string;

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @OneToMany(() => Question, (question) => question.interviewTemplate, {
    nullable: true,
  })
  @Field(() => [Question], { nullable: true })
  questions?: Question[];

  @OneToMany(
    () => InterviewTemplateQuestionBank,
    (tplQuestionBank) => tplQuestionBank.interviewTemplate,
  )
  interviewTemplateQuestionBanks: InterviewTemplateQuestionBank[];

  @OneToMany(() => Interview, (interview) => interview.interviewTemplate)
  interviews: Interview[];

  @ManyToMany(() => Tag, (tag) => tag.interviewTemplates, { nullable: true })
  @JoinTable()
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}
