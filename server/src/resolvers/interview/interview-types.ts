import { Field, InputType, Int } from 'type-graphql';
import { InterviewEvaluation } from '../../entities/Interview';

@InputType()
export class InterviewInput {
  @Field(() => Int)
  interviewTemplateId: number;

  @Field(() => Int)
  candidateId: number;

  @Field(() => Int)
  interviewerId: number;

  @Field(() => String)
  deadline: string;
}

@InputType()
export class InterviewEvaluationInput {
  @Field(() => InterviewEvaluation)
  evaluationValue: InterviewEvaluation;

  @Field(() => String, { nullable: true })
  evaluationNotes?: string;
}
