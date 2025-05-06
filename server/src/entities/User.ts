import { Field, Int, ObjectType, registerEnumType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Interview } from './Interview';

export enum UserRole {
  ADMIN = 'admin',
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'candidate',
}

// Register the enum with Type-GraphQL
registerEnumType(UserRole, {
  name: 'UserRole', // This is the name that will be used in the GraphQL schema
  description: 'User role enumeration',
});

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  fullName!: string;

  @Field(() => String)
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Field(() => String)
  @CreateDateColumn({ type: 'date' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Interview], { nullable: true })
  @OneToMany(() => Interview, (interview) => interview.user)
  interviews?: Interview[];
}
