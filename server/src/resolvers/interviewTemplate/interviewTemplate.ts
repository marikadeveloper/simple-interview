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
}
