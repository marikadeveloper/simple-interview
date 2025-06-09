import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { EntityManager } from 'typeorm'; // Corrected imports
import { dataSource } from '../../';
import { Question } from '../../entities/Question';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { errorStrings } from '../../utils/errorStrings';
import { QuestionInput, UpdateQuestionSortOrderInput } from './question-types';

@Resolver(Question)
export class QuestionResolver {
  @Query(() => [Question], { nullable: true })
  @UseMiddleware(isAuth)
  async getQuestions(
    @Arg('interviewTemplateId', () => Int) interviewTemplateId: number,
  ): Promise<Question[] | null> {
    const questions = await Question.find({
      where: { interviewTemplate: { id: interviewTemplateId } },
      relations: ['interviewTemplate'],
      order: { sortOrder: 'ASC' }, // Add order by sortOrder
    });

    return questions;
  }

  @Mutation(() => Question, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createQuestion(
    @Arg('interviewTemplateId', () => Int) interviewTemplateId: number,
    @Arg('input', () => QuestionInput) input: QuestionInput,
  ): Promise<Question | null> {
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

  @Mutation(() => Question, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateQuestion(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => QuestionInput) input: QuestionInput,
  ): Promise<Question | null> {
    const question = await Question.findOne({ where: { id } });
    if (!question) {
      throw new Error(errorStrings.question.notFound);
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

    if (question.interviewTemplate) {
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
    } else if (question.questionBank) {
      // If the question is part of a question bank, delete it without updating sortOrder
      await Question.delete({ id });
    }

    return true;
  }

  @Mutation(() => Boolean) // New mutation for updating sort order
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateQuestionSortOrder(
    @Arg('input', () => UpdateQuestionSortOrderInput)
    { questionId, newSortOrder }: UpdateQuestionSortOrderInput,
  ): Promise<boolean> {
    // Use getManager() to correctly access the transaction method
    return dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const question = await transactionalEntityManager.findOne(Question, {
          where: { id: questionId },
          relations: ['interviewTemplate'],
        });

        if (!question) {
          // throw new Error('Question not found'); // Optional: throw for specific error handling
          return false;
        }

        const oldSortOrder = question.sortOrder;
        // Ensure interviewTemplate is loaded and has an id
        if (
          !question.interviewTemplate ||
          typeof question.interviewTemplate.id === 'undefined'
        ) {
          // throw new Error('Interview template not found for the question');
          return false;
        }
        const interviewTemplateId = question.interviewTemplate.id;

        if (oldSortOrder === newSortOrder) {
          return true; // No change needed
        }

        // Basic validation for newSortOrder (e.g., non-negative)
        // More comprehensive validation (e.g., within bounds of actual question count) can be added
        if (newSortOrder < 0) {
          // throw new Error('New sort order cannot be negative');
          return false;
        }

        // Determine the maximum sort order for this template to prevent out-of-bounds newSortOrder
        const maxSortOrderQueryResult = await transactionalEntityManager
          .createQueryBuilder(Question, 'question')
          .select('MAX(question.sortOrder)', 'maxSortOrder')
          .where('question.interviewTemplate.id = :interviewTemplateId', {
            interviewTemplateId,
          })
          .getRawOne();

        const maxSortOrder = maxSortOrderQueryResult?.maxSortOrder ?? -1; // if no questions, maxSortOrder is -1

        if (newSortOrder > maxSortOrder + 1 && oldSortOrder > maxSortOrder) {
          // if trying to move a non-existent item to a new non-existent place
          // this case might indicate an issue or an attempt to place it far out of bounds
          // if it was an existing item, newSortOrder > maxSortOrder would be handled below
        } else if (
          newSortOrder > maxSortOrder &&
          oldSortOrder <= maxSortOrder
        ) {
          // If newSortOrder is beyond the current max, cap it to be the last item
          // This handles dragging to the very end or beyond
          newSortOrder = maxSortOrder;
        }

        // Re-check if change is still needed after potential capping
        if (oldSortOrder === newSortOrder) {
          return true;
        }

        if (newSortOrder < oldSortOrder) {
          // Question moved up (e.g., from sortOrder 5 to 2)
          // Increment sortOrder for questions that were between newSortOrder (inclusive)
          // and oldSortOrder (exclusive)
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Question)
            .set({ sortOrder: () => '"sortOrder" + 1' })
            .where(
              '"interviewTemplateId" = :interviewTemplateId AND "sortOrder" >= :newSortOrder AND "sortOrder" < :oldSortOrder',
              { interviewTemplateId, newSortOrder, oldSortOrder },
            )
            .execute();
        } else {
          // Question moved down (e.g., from sortOrder 2 to 5)
          // Decrement sortOrder for questions that were between oldSortOrder (exclusive)
          // and newSortOrder (inclusive)
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Question)
            .set({ sortOrder: () => '"sortOrder" - 1' })
            .where(
              '"interviewTemplateId" = :interviewTemplateId AND "sortOrder" > :oldSortOrder AND "sortOrder" <= :newSortOrder',
              { interviewTemplateId, oldSortOrder, newSortOrder },
            )
            .execute();
        }

        // Update the target question's sortOrder
        question.sortOrder = newSortOrder;
        await transactionalEntityManager.save(question);

        return true;
      },
    );
  }
}
