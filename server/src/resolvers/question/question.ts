import { Arg, Int, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { errorStrings } from '../../utils/errorStrings';
import { QuestionCreateInput, QuestionUpdateInput } from './question-types';

@Resolver(Question)
export class QuestionResolver {
  @Mutation(() => Question, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createQuestion(
    @Arg('input', () => QuestionCreateInput) input: QuestionCreateInput,
  ): Promise<Question | null> {
    let question: Question | null = null;

    if (!input.questionBankId && !input.interviewTemplateId) {
      // If the question is not part of a question bank or interview template, throw an error
      throw new Error(errorStrings.question.missingTemplateOrBank);
    }

    if (input.questionBankId) {
      // If the question is part of a question bank, set the questionBankId
      question = await Question.create({
        title: input.title,
        description: input.description,
        questionBank: { id: input.questionBankId },
      }).save();
    } else {
      question = await Question.create({
        title: input.title,
        description: input.description,
      }).save();

      // assign the question to the interview template NN relation
      if (input.interviewTemplateId) {
        const interviewTemplate = await InterviewTemplate.findOneBy({
          id: input.interviewTemplateId,
        });
        if (!interviewTemplate) {
          throw new Error(errorStrings.interviewTemplate.notFound);
        }

        // If the interview template exists, add the question to it
        if (!interviewTemplate.questions) {
          interviewTemplate.questions = [];
        }
        interviewTemplate.questions.push(question);
        await interviewTemplate.save();
      }
    }
    return question;
  }

  @Mutation(() => Question, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateQuestion(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => QuestionUpdateInput) input: QuestionUpdateInput,
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
    });
    if (!question) {
      return false;
    }

    // fix sort order
    // if (question.interviewTemplate) {
    //   const interviewTemplateId = question.interviewTemplate.id;
    //   const deletedSortOrder = question.sortOrder;

    //   await Question.delete({ id });

    //   // Update sortOrder of subsequent questions
    //   await Question.createQueryBuilder()
    //     .update(Question)
    //     .set({ sortOrder: () => '"sortOrder" - 1' })
    //     .where(
    //       '"interviewTemplateId" = :interviewTemplateId AND "sortOrder" > :deletedSortOrder',
    //       {
    //         interviewTemplateId,
    //         deletedSortOrder,
    //       },
    //     )
    //     .execute();
    // }

    await Question.delete({ id });

    return true;
  }

  /*
  @Mutation(() => Boolean)
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
    */
}
