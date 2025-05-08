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
import { Tag } from '../../entities/Tag';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { InterviewTemplateInput } from './interviewTemplate-types';

@Resolver(InterviewTemplate)
export class InterviewTemplateResolver {
  @Query(() => [InterviewTemplate])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewTemplates(
    @Arg('tagsIds', () => [Int], { nullable: true }) tagsIds: number[],
  ): Promise<InterviewTemplate[]> {
    const queryBuilder = InterviewTemplate.createQueryBuilder(
      'interviewTemplate',
    )
      .leftJoinAndSelect('interviewTemplate.tags', 'tag')
      .orderBy('interviewTemplate.createdAt', 'DESC');

    if (tagsIds.length) {
      queryBuilder.where(
        `interviewTemplate.id IN (
          SELECT it.id FROM interview_template it
          LEFT JOIN interview_template_tags_tag itt ON it.id = itt."interviewTemplateId"
          WHERE itt."tagId" IN (:...tagsIds)
        )`,
        { tagsIds },
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
      relations: ['questions', 'tags'],
      order: { questions: { sortOrder: 'ASC' } },
    });
    if (!interviewTemplate) {
      return null;
    }
    return interviewTemplate;
  }

  @Mutation(() => InterviewTemplate)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterviewTemplate(
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplate> {
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

  @Mutation(() => InterviewTemplate)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateInterviewTemplate(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplate | null> {
    const interviewTemplate = await InterviewTemplate.findOneBy({ id });
    if (!interviewTemplate) {
      return null;
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
}
