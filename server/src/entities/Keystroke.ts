import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './Answer';

/**
 * Keystroke event types:
 * - INSERT: Character inserted at position
 * - DELETE: Character deleted at position
 * - REPLACE: Characters replaced at position
 */
export enum KeystrokeType {
  INSERT = 'insert',
  DELETE = 'delete',
  REPLACE = 'replace',
}

@ObjectType()
@Entity()
export class Keystroke extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: KeystrokeType,
  })
  type!: KeystrokeType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  value?: string;

  @Field(() => Int)
  @Column()
  position!: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  length?: number;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp!: Date;

  @Field(() => Int)
  @Column()
  relativeTimestamp!: number;

  @Field(() => Answer)
  @ManyToOne(() => Answer, (answer) => answer.keystrokes, {
    onDelete: 'CASCADE',
  })
  answer!: Answer;
}
