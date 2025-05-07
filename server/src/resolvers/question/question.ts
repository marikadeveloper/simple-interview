import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Question } from '../../entities/Question';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';

@InputType()
class QuestionInput {
  @Field(() => String)
  title: string;
  @Field(() => String)
  description: string;
}

@Resolver(Question)
export class QuestionResolver {
  @Query(() => [Question])
  @UseMiddleware(isAuth)
  async getQuestions(
    @Arg('interviewTemplateId', () => Int) interviewTemplateId: number,
  ): Promise<Question[]> {
    const questions = await Question.find({
      where: { interviewTemplate: { id: interviewTemplateId } },
      relations: ['interviewTemplate'],
      order: { sortOrder: 'ASC' }, // Add order by sortOrder
    });

    return questions;
  }

  @Mutation(() => Question)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createQuestion(
    @Arg('interviewTemplateId', () => Int) interviewTemplateId: number,
    @Arg('input', () => QuestionInput) input: QuestionInput,
  ): Promise<Question> {
    // Get existing questions for the template to determine sortOrder
    const existingQuestions = await Question.find({
      where: { interviewTemplate: { id: interviewTemplateId } },
    });
    const sortOrder = existingQuestions.length;

    const question = await Question.create({
      title: input.title,
      description: input.description,
      interviewTemplate: { id: interviewTemplateId },
      sortOrder, // Set sortOrder
    }).save();

    return question;
  }

  @Mutation(() => Question)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateQuestion(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => QuestionInput) input: QuestionInput,
  ): Promise<Question | null> {
    const question = await Question.findOne({ where: { id } });
    if (!question) {
      return null;
    }
    question.title = input.title;
    question.description = input.description;
    await question.save();
    return question;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteQuestion(@Arg('id', () => Int) id: number): Promise<boolean> {
    const question = await Question.findOne({
      where: { id },
      relations: ['interviewTemplate'],
    });
    if (!question) {
      return false;
    }

    const interviewTemplateId = question.interviewTemplate.id;
    const deletedSortOrder = question.sortOrder;

    await Question.delete({ id });

    // Update sortOrder of subsequent questions
    await Question.createQueryBuilder()
      .update(Question)
      .set({ sortOrder: () => '"sortOrder" - 1' })
      .where(
        '"interviewTemplateId" = :interviewTemplateId AND "sortOrder" > :deletedSortOrder',
        {
          interviewTemplateId,
          deletedSortOrder,
        },
      )
      .execute();

    return true;
  }
}
