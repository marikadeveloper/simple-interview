import {
  Arg,
  Field,
  InputType,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';

@InputType()
class InterviewTemplateInput {
  @Field(() => String) name!: string;
  @Field(() => String) description!: string;
}

@Resolver(InterviewTemplate)
export class InterviewTemplateResolver {
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
    await interviewTemplate.save();
    return interviewTemplate;
  }

  @Mutation(() => InterviewTemplate)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateInterviewTemplate(
    @Arg('id', () => String) id: number,
    @Arg('input', () => InterviewTemplateInput) input: InterviewTemplateInput,
  ): Promise<InterviewTemplate | null> {
    const interviewTemplate = await InterviewTemplate.findOneBy({ id });
    if (!interviewTemplate) {
      return null;
    }
    interviewTemplate.name = input.name;
    interviewTemplate.description = input.description;
    await interviewTemplate.save();
    return interviewTemplate;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteInterviewTemplate(@Arg('id', () => String) id: number) {
    const interviewTemplate = await InterviewTemplate.delete({ id });
    if (!interviewTemplate.affected) {
      return false;
    }
    return true;
  }
}
