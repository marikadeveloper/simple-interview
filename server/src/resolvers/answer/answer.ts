import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Answer } from '../../entities/Answer';
import { Interview, InterviewStatus } from '../../entities/Interview';
import { isAuth } from '../../middleware/isAuth';
import { CreateAnswerInput } from './answer-types';

@Resolver(Answer)
export class AnswerResolver {
  @Query(() => Answer, { nullable: true })
  @UseMiddleware(isAuth)
  async answer(@Arg('id') id: number): Promise<Answer | null> {
    return Answer.findOneBy({ id });
  }

  @Mutation(() => Answer, { nullable: true })
  @UseMiddleware(isAuth)
  async createAnswer(
    @Arg('input', () => CreateAnswerInput) input: CreateAnswerInput,
    @Ctx() { req }: MyContext,
  ): Promise<Answer | null> {
    // check if the user is the interview's candidate
    const interview = await Interview.findOneBy({
      id: input.interviewId,
      user: { id: req.session.userId },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Interview is completed');
    }

    const answer = await Answer.create({
      question: { id: input.questionId },
      interview: { id: input.interviewId },
      text: input.text,
      language: input.language || 'plaintext',
    }).save();

    return answer;
  }
}
