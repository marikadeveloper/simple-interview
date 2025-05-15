import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { Answer } from '../../entities/Answer';
import { Interview, InterviewStatus } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { User, UserRole } from '../../entities/User';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { InterviewInput } from './interview-types';

@Resolver(Interview)
export class InterviewResolver {
  @FieldResolver(() => InterviewStatus)
  async status(@Root() interview: Interview): Promise<InterviewStatus> {
    if (interview.status === InterviewStatus.COMPLETED) {
      return InterviewStatus.COMPLETED;
    }
    // EXPIRED
    const now = new Date();
    const deadline = new Date(interview.deadline);
    if (deadline < now) {
      return InterviewStatus.EXPIRED;
    }
    // In progress -> at least 1 question answered
    const answers = await Answer.find({
      where: { interview: { id: interview.id } },
    });
    if (answers.length > 0) {
      return InterviewStatus.IN_PROGRESS;
    }

    return InterviewStatus.PENDING;
  }

  @Mutation(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterview(
    @Arg('input', () => InterviewInput) input: InterviewInput,
  ): Promise<Interview | null> {
    const { interviewTemplateId, candidateId, deadline } = input;

    // Check if interview template exists
    const interviewTemplate = await InterviewTemplate.findOneBy({
      id: interviewTemplateId,
    });

    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }

    // Check if candidate exists
    const candidate = await User.findOneBy({
      id: candidateId,
      role: UserRole.CANDIDATE,
    });

    if (!candidate) {
      throw new Error(errorStrings.user.notCandidate);
    }

    // Check if the date is valid
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      throw new Error(errorStrings.date.invalidFormat);
    }

    // Check if the date is in the past
    const now = new Date();
    if (date < now) {
      throw new Error(errorStrings.date.mustBeInTheFuture);
    }

    const interview = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateId },
      deadline,
      status: InterviewStatus.PENDING,
    }).save();

    return interview;
  }

  @Query(() => [Interview], { nullable: true })
  @UseMiddleware(isAuth)
  async getInterviews(@Ctx() { req }: MyContext): Promise<Interview[] | null> {
    // admin and interviewer can see all interviews
    // candidate can only see their own interviews
    const userId = req.session.userId;
    // I am sure I have a valid user here
    const user: User = (await User.findOneBy({ id: userId })) as User;

    if (user.role === UserRole.CANDIDATE) {
      const interviews = await Interview.find({
        where: { user: { id: userId } },
        relations: ['interviewTemplate', 'user'],
        order: { deadline: 'DESC' },
      });

      return interviews;
    } else {
      const interviews = await Interview.find({
        relations: ['interviewTemplate', 'user'],
        order: { deadline: 'DESC' },
      });
      return interviews;
    }
  }

  @Query(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterview(
    @Arg('id', () => Int) id: number,
  ): Promise<Interview | null> {
    const interview = await Interview.findOne({
      where: { id },
      relations: ['interviewTemplate', 'user'],
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    return interview;
  }

  @Query(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  async getCandidateInterview(
    @Ctx() { req }: MyContext,
    @Arg('id', () => Int) id: number,
  ): Promise<Interview | null> {
    const userId = req.session.userId;

    const interview = await Interview.findOne({
      where: { id, user: { id: userId } },
      relations: [
        'interviewTemplate',
        'interviewTemplate.questions',
        'user',
        'answers',
      ],
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    return interview;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async confirmInterviewCompletion(
    @Ctx() { req }: MyContext,
    @Arg('id', () => Int) id: number,
  ) {
    const userId = req.session.userId;

    const interview = await Interview.findOne({
      where: { id, user: { id: userId } },
    });

    if (!interview) {
      return false;
    }

    interview.status = InterviewStatus.COMPLETED;
    await interview.save();

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteInterview(@Arg('id', () => Int) id: number) {
    // Check if the interview exists
    const interview = await Interview.findOne({
      where: { id },
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    if (interview.status !== InterviewStatus.PENDING) {
      throw new Error(errorStrings.interview.canNotDelete);
    }

    await Interview.delete({ id });

    return true;
  }

  @Mutation(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateInterview(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => InterviewInput) input: InterviewInput,
  ): Promise<Interview | null> {
    // check if the interview exists
    const interview = await Interview.findOne({
      where: { id },
      relations: ['interviewTemplate', 'user'],
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    if (interview.status !== InterviewStatus.PENDING) {
      throw new Error(errorStrings.interview.canNotUpdate);
    }

    const { interviewTemplateId, candidateId, deadline } = input;

    // Check if interview template exists
    const interviewTemplate = await InterviewTemplate.findOneBy({
      id: interviewTemplateId,
    });

    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }

    // Check if candidate exists
    const candidate = await User.findOneBy({
      id: candidateId,
      role: UserRole.CANDIDATE,
    });

    if (!candidate) {
      throw new Error(errorStrings.user.notCandidate);
    }

    // Check if the date is valid
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      throw new Error(errorStrings.date.invalidFormat);
    }

    // Check if the date is in the past
    const now = new Date();
    if (date < now) {
      throw new Error(errorStrings.date.mustBeInTheFuture);
    }

    await Interview.update(
      { id },
      {
        interviewTemplate: { id: interviewTemplateId },
        user: { id: candidateId },
        deadline,
        status: InterviewStatus.PENDING,
      },
    );

    return interview;
  }
}
