import { Field, Int, ObjectType } from 'type-graphql';
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
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@ObjectType()
@Entity()
export class Interview extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.PENDING,
  })
  status!: InterviewStatus;

  @Field(() => String)
  @Column({ type: 'date' })
  deadline!: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

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

  @Field(() => [Answer], { nullable: true })
  @OneToMany(() => Answer, (answer) => answer.interview, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  answers: Answer[];
}
