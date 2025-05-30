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
export class Keystroke {
  @Field(() => String)
  snapshot!: string; // contains a snapshot of the answer text at this keystroke

  @Field(() => Int)
  @Column()
  relativeTimestamp!: number;
}

@ObjectType()
@Entity()
export class Answer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  text: string;

  @Field(() => String, { defaultValue: 'plaintext' })
  @Column({ default: 'plaintext' })
  language: string;

  @Field(() => [Keystroke], { nullable: true })
  @Column('simple-json', { nullable: true })
  keystrokes?: Keystroke[];

  @Field(() => Question)
  @ManyToOne(() => Question, { nullable: false })
  question!: Question;

  @Field(() => Interview)
  @ManyToOne(() => Interview, (interview) => interview.answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  interview!: Interview;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  hasReplay: boolean;
}
