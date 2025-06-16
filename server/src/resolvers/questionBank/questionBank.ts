import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { QuestionBank } from '../../entities/QuestionBank';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { errorStrings } from '../../utils/errorStrings';
import { generateUniqueSlug } from '../../utils/slugify';
import { QuestionBankInput } from './questionBank-types';

@Resolver(QuestionBank)
export class QuestionBankResolver {
  @Query(() => [QuestionBank])
  async questionBanks(): Promise<QuestionBank[]> {
    return QuestionBank.find();
  }

  @Query(() => QuestionBank, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getQuestionBank(
    @Arg('id', () => Int) id: number,
  ): Promise<QuestionBank | null> {
    const questionBank = await QuestionBank.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!questionBank) {
      throw new Error(errorStrings.questionBank.notFound);
    }
    return questionBank;
  }

  @Query(() => QuestionBank, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getQuestionBankBySlug(
    @Arg('slug') slug: string,
  ): Promise<QuestionBank | null> {
    return QuestionBank.findOne({
      where: { slug },
      relations: ['questions'],
    });
  }

  @Mutation(() => QuestionBank)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createQuestionBank(
    @Arg('input') input: QuestionBankInput,
  ): Promise<QuestionBank> {
    const slug = await generateUniqueSlug(input.name, async (slug) => {
      const existing = await QuestionBank.findOneBy({ slug });
      return !!existing;
    });

    const questionBank = new QuestionBank();
    questionBank.name = input.name;
    questionBank.slug = slug;

    return questionBank.save();
  }

  @Mutation(() => QuestionBank, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateQuestionBank(
    @Arg('id', () => Int) id: number,
    @Arg('name') name: string,
  ): Promise<QuestionBank | null> {
    const questionBank = await QuestionBank.findOneBy({ id });
    if (!questionBank) {
      throw new Error(errorStrings.questionBank.notFound);
    }
    questionBank.name = name;
    await questionBank.save();
    return questionBank;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteQuestionBank(@Arg('id', () => Int) id: number): Promise<boolean> {
    const questionBank = await QuestionBank.findOneBy({ id });
    if (!questionBank) {
      throw new Error(errorStrings.questionBank.notFound);
    }

    // if question bank is used in any interview template, throw an error
    const interviewTemplates = await InterviewTemplate.find({
      where: { questions: { questionBank: { id } } },
    });
    if (interviewTemplates.length > 0) {
      throw new Error(errorStrings.questionBank.inUse);
    }

    await QuestionBank.delete({ id });
    return true;
  }
}
