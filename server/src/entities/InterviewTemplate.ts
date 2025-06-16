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
  @Column({ unique: true })
  slug!: string;

  @Field(() => String)
  @Column()
  description!: string;

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @ManyToMany(() => Question, (question) => question.interviewTemplates, {
    nullable: true,
  })
  @Field(() => [Question])
  questions: Question[];

  @OneToMany(() => Interview, (interview) => interview.interviewTemplate)
  interviews: Interview[];

  @ManyToMany(() => Tag, (tag) => tag.interviewTemplates, { nullable: true })
  @JoinTable()
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}
