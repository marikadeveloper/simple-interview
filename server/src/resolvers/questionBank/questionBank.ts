import { errorStrings } from 'src/utils/errorStrings';
import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql';
import { QuestionBank } from '../../entities/QuestionBank';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';

@Resolver(QuestionBank)
export class QuestionBankResolver {
  @Query(() => [QuestionBank], { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getQuestionBanks(): Promise<QuestionBank[] | null> {
    const questionBanks = await QuestionBank.find({
      relations: ['questions'],
      order: { name: 'ASC' },
    });

    return questionBanks;
  }

  @Query(() => QuestionBank, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getQuestionBank(@Arg('id') id: number): Promise<QuestionBank | null> {
    const questionBank = await QuestionBank.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!questionBank) {
      throw new Error(errorStrings.questionBank.notFound);
    }
    return questionBank;
  }
}
