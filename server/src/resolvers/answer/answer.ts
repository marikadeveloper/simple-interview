import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { In } from 'typeorm';
import { Answer } from '../../entities/Answer';
import { Interview, InterviewStatus } from '../../entities/Interview';
import { Question } from '../../entities/Question';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { CreateAnswerInput, SaveKeystrokesInput } from './answer-types';

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
    const interview = await Interview.findOne({
      where: {
        id: input.interviewId,
        user: { id: req.session.userId },
      },
      relations: ['interviewTemplate'],
    });
    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Interview is completed');
    }

    const question = await Question.findOneBy({
      id: input.questionId,
      interviewTemplates: { id: In([interview.interviewTemplate.id]) },
    });

    if (!question) {
      throw new Error('Question not found in this interview template');
    }

    const answer = await Answer.create({
      question: { id: input.questionId },
      interview: { id: input.interviewId },
      text: input.text,
      language: input.language || 'plaintext',
    }).save();

    return answer;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async saveKeystrokes(
    @Arg('input') input: SaveKeystrokesInput,
    @Ctx() { req }: MyContext,
  ): Promise<boolean> {
    try {
      const answer = await Answer.findOne({
        where: { id: input.answerId },
        relations: ['interview', 'interview.user'],
      });

      if (!answer) {
        throw new Error('Answer not found');
      }

      // Ensure the logged-in user is the one who owns the interview
      if (answer.interview.user.id !== req.session.userId) {
        throw new Error('Not authorized to modify this answer');
      }

      // Insert all keystrokes
      answer.keystrokes = input.keystrokes.map((keystroke) => ({
        id: keystroke.id,
        snapshot: keystroke.snapshot,
        relativeTimestamp: keystroke.relativeTimestamp,
      }));

      // Mark that the answer has replay data
      answer.hasReplay = true;
      await answer.save();

      return true;
    } catch (error) {
      console.error('Error saving keystrokes:', error);
      return false;
    }
  }
}
