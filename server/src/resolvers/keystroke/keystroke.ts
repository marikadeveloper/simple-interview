import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Answer } from '../../entities/Answer';
import { Keystroke } from '../../entities/Keystroke';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { SaveKeystrokesInput } from './keystroke-types';

@Resolver(Keystroke)
export class KeystrokeResolver {
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

      // Batch insert all keystrokes
      await Keystroke.createQueryBuilder()
        .insert()
        .into(Keystroke)
        .values(
          input.keystrokes.map((keystroke) => ({
            ...keystroke,
            answer: { id: input.answerId },
          })),
        )
        .execute();

      // Mark that the answer has replay data
      answer.hasReplay = true;
      await answer.save();

      return true;
    } catch (error) {
      console.error('Error saving keystrokes:', error);
      return false;
    }
  }

  @Query(() => [Keystroke], { nullable: true })
  @UseMiddleware(isAuth)
  async getKeystrokes(
    @Arg('answerId') answerId: number,
    @Ctx() { req }: MyContext,
  ): Promise<Keystroke[] | null> {
    try {
      const answer = await Answer.findOne({
        where: { id: answerId },
        relations: ['interview', 'interview.user'],
      });

      if (!answer) {
        return null;
      }

      // Get keystrokes sorted by their relative timestamp
      const keystrokes = await Keystroke.find({
        where: { answer: { id: answerId } },
        order: { relativeTimestamp: 'ASC' },
      });

      return keystrokes;
    } catch (error) {
      console.error('Error retrieving keystrokes:', error);
      return null;
    }
  }
}
