import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interview } from './Interview';
import { Keystroke } from './Keystroke';
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

  @Field(() => String, { defaultValue: 'plaintext' })
  @Column({ default: 'plaintext' })
  language: string;

  @Field(() => Question)
  @ManyToOne(() => Question, { nullable: false })
  question!: Question;

  @Field(() => Interview)
  @ManyToOne(() => Interview, (interview) => interview.answers, {
    nullable: false,
  })
  interview!: Interview;

  @Field(() => [Keystroke], { nullable: true })
  @OneToMany(() => Keystroke, (keystroke) => keystroke.answer, {
    nullable: true,
  })
  keystrokes: Keystroke[];

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  hasReplay: boolean;
}
