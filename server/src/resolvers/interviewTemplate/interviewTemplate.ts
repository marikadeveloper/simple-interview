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
import {
  InterviewTemplateInput,
  InterviewTemplateMultipleResponse,
  InterviewTemplateSingleResponse,
} from './interviewTemplate-types';

@Resolver(InterviewTemplate)
export class InterviewTemplateResolver {
  @Query(() => InterviewTemplateMultipleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewTemplates(
    @Arg('tagsIds', () => [Int], { nullable: true }) tagsIds: number[],
  ): Promise<InterviewTemplateMultipleResponse> {
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

    return { interviewTemplates };
  }

  @Query(() => InterviewTemplateSingleResponse, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewTemplate(
    @Arg('id', () => Int) id: number,
  ): Promise<InterviewTemplateSingleResponse> {
    const interviewTemplate = await InterviewTemplate.findOne({
      where: { id },
      relations: ['questions', 'tags'],
      order: { questions: { sortOrder: 'ASC' } },
    });
    if (!interviewTemplate) {
      return {
        errors: [
          {
            field: 'id',
            message: 'Interview template not found',
          },
        ],
      };
    }
    return { interviewTemplate };
  }

  @Mutation(() => InterviewTemplateSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterviewTemplate(
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplateSingleResponse> {
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
    return { interviewTemplate };
  }

  @Mutation(() => InterviewTemplateSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateInterviewTemplate(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplateSingleResponse> {
    const interviewTemplate = await InterviewTemplate.findOneBy({ id });
    if (!interviewTemplate) {
      return {
        errors: [
          {
            field: 'id',
            message: 'Interview template not found',
          },
        ],
      };
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
    return { interviewTemplate };
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
