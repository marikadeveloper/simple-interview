import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { In } from 'typeorm';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { Tag } from '../../entities/Tag';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { errorStrings } from '../../utils/errorStrings';
import {
  AddQuestionsFromQuestionBankInput,
  InterviewTemplateInput,
} from './interviewTemplate-types';

@Resolver(InterviewTemplate)
export class InterviewTemplateResolver {
  @Query(() => [InterviewTemplate], { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewTemplates(
    @Arg('tagsIds', () => [Int], { nullable: true }) tagsIds: number[],
  ): Promise<InterviewTemplate[] | null> {
    const queryBuilder = InterviewTemplate.createQueryBuilder(
      'interviewTemplate',
    )
      .leftJoinAndSelect('interviewTemplate.tags', 'tag')
      .orderBy('interviewTemplate.createdAt', 'DESC');

    if (tagsIds && tagsIds.length) {
      queryBuilder.where(
        `interviewTemplate.id IN (
          SELECT it.id FROM interview_template it
          LEFT JOIN interview_template_tags_tag itt ON it.id = itt."interviewTemplateId"
          WHERE itt."tagId" IN (:...tagsIds)
          GROUP BY it.id
          HAVING COUNT(DISTINCT itt."tagId") = :tagsCount
        )`,
        { tagsIds, tagsCount: tagsIds.length },
      );
    }

    const interviewTemplates = await queryBuilder.getMany();

    return interviewTemplates;
  }

  @Query(() => InterviewTemplate, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewTemplate(
    @Arg('id', () => Int) id: number,
  ): Promise<InterviewTemplate | null> {
    const interviewTemplate = await InterviewTemplate.findOne({
      where: { id },
      relations: ['questions', 'questions.questionBank', 'tags'],
    });
    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }
    return interviewTemplate;
  }

  @Mutation(() => InterviewTemplate, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterviewTemplate(
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplate | null> {
    const interviewTemplate = InterviewTemplate.create({
      name: input.name,
      description: input.description,
    });

    // If tags are provided, set them
    if (input.tagsIds) {
      const tags = await Tag.findBy({
        id: In(input.tagsIds),
      });
      interviewTemplate.tags = tags;
    }

    await interviewTemplate.save();
    return interviewTemplate;
  }

  @Mutation(() => InterviewTemplate, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateInterviewTemplate(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplate | null> {
    const interviewTemplate = await InterviewTemplate.findOneBy({ id });
    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }
    interviewTemplate.name = input.name;
    interviewTemplate.description = input.description;

    // If tags are provided, update them
    if (input.tagsIds) {
      const tags = await Tag.findBy({
        id: In(input.tagsIds),
      });
      interviewTemplate.tags = tags;
    } else {
      interviewTemplate.tags = [];
    }

    await interviewTemplate.save();
    return interviewTemplate;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteInterviewTemplate(@Arg('id', () => Int) id: number) {
    const interviewTemplate = await InterviewTemplate.delete({ id });
    if (!interviewTemplate.affected) {
      return false;
    }
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async addQuestionsFromQuestionBank(
    @Arg('input', () => AddQuestionsFromQuestionBankInput)
    input: AddQuestionsFromQuestionBankInput,
  ): Promise<boolean> {
    const { interviewTemplateId, questionIds } = input;

    // Check if interview template exists
    const interviewTemplate = await InterviewTemplate.findOne({
      where: { id: interviewTemplateId },
      relations: ['questions'],
    });

    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }

    // Get the questions to add
    const questionsToAdd = await Question.findBy({
      id: In(questionIds),
    });

    if (questionsToAdd.length !== questionIds.length) {
      throw new Error('Some questions were not found');
    }

    // Initialize questions array if it doesn't exist
    if (!interviewTemplate.questions) {
      interviewTemplate.questions = [];
    }

    // Filter out questions that are already in the template
    const existingQuestionIds = interviewTemplate.questions.map((q) => q.id);
    const newQuestions = questionsToAdd.filter(
      (q) => !existingQuestionIds.includes(q.id),
    );

    // Add the new questions to the template
    interviewTemplate.questions.push(...newQuestions);
    await interviewTemplate.save();

    return true;
  }
}
