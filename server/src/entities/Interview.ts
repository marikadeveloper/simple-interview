import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Answer } from './Answer';
import { InterviewTemplate } from './InterviewTemplate';
import { User } from './User';

export enum InterviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}
// Register the enum with Type-GraphQL
registerEnumType(InterviewStatus, {
  name: 'InterviewStatus', // This is the name that will be used in the GraphQL schema
  description: 'Interview status enumeration',
});

export enum InterviewEvaluation {
  BAD = 'BAD',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
}
// Register the enum with Type-GraphQL
registerEnumType(InterviewEvaluation, {
  name: 'InterviewEvaluation', // This is the name that will be used in the GraphQL schema
  description: 'Interview evaluation enumeration',
});

@ObjectType()
@Entity()
export class Interview extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ unique: true })
  slug!: string;

  @Field(() => InterviewStatus)
  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.PENDING,
  })
  status!: InterviewStatus;

  @Field(() => String)
  @Column({ type: 'date' })
  deadline!: Date;

  @Field(() => InterviewEvaluation, { nullable: true })
  @Column({ type: 'enum', enum: InterviewEvaluation, nullable: true })
  evaluationValue?: InterviewEvaluation;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  evaluationNotes?: string;

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  completedAt?: Date;

  @Field(() => InterviewTemplate)
  @ManyToOne(
    () => InterviewTemplate,
    (interviewTemplate) => interviewTemplate.interviews,
  )
  interviewTemplate!: InterviewTemplate;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.interviews, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.interviewsAsInterviewer)
  interviewer!: User;

  @Field(() => [Answer], { nullable: true })
  @OneToMany(() => Answer, (answer) => answer.interview, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  answers?: Answer[];
}
