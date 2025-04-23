import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interview } from './Interview';
import { Question } from './Question';

@ObjectType()
@Entity()
export class Answer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  text: string;

  @Field(() => Question)
  @ManyToOne(() => Question)
  question!: Question;

  @Field(() => Interview)
  @ManyToOne(() => Interview, (interview) => interview.answers)
  interview!: Interview;
}
