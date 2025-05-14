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
import { Interview, InterviewStatus } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { User, UserRole } from '../../entities/User';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import {
  InterviewInput,
  InterviewMultipleResponse,
  InterviewSingleResponse,
} from './interview-types';

@Resolver(Interview)
export class InterviewResolver {
  @FieldResolver(() => InterviewStatus)
  status(@Root() interview: Interview): InterviewStatus {
    const now = new Date();
    const deadline = new Date(interview.deadline);
    if (deadline < now) {
      return InterviewStatus.EXPIRED;
    }

    return InterviewStatus.PENDING;
  }

  @Mutation(() => InterviewSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterview(
    @Arg('input', () => InterviewInput) input: InterviewInput,
  ) {
    const { interviewTemplateId, candidateId, deadline } = input;

    // Check if interview template exists
    const interviewTemplate = await InterviewTemplate.findOneBy({
      id: interviewTemplateId,
    });

    if (!interviewTemplate) {
      return {
        errors: [
          {
            field: 'interviewTemplateId',
            message: 'Interview template not found',
          },
        ],
      };
    }

    // Check if candidate exists
    const candidate = await User.findOneBy({
      id: candidateId,
      role: UserRole.CANDIDATE,
    });

    if (!candidate) {
      return {
        errors: [
          {
            field: 'candidateId',
            message: 'Candidate not found or not a candidate role',
          },
        ],
      };
    }

    // Check if the date is valid
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      return {
        errors: [
          {
            field: 'deadline',
            message: 'Invalid date format',
          },
        ],
      };
    }

    // Check if the date is in the past
    const now = new Date();
    if (date < now) {
      return {
        errors: [
          {
            field: 'deadline',
            message: 'Date must be in the future',
          },
        ],
      };
    }

    const interview = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateId },
      deadline,
    }).save();

    return { interview };
  }

  @Query(() => InterviewMultipleResponse)
  @UseMiddleware(isAuth)
  async getInterviews(@Ctx() { req }: MyContext) {
    // admin and interviewer can see all interviews
    // candidate can only see their own interviews
    const userId = req.session.userId;
    // I am sure I have a valid user here
    const user: User = (await User.findOneBy({ id: userId })) as User;

    if (user.role === UserRole.CANDIDATE) {
      const interviews = await Interview.find({
        where: { user: { id: userId } },
        relations: ['interviewTemplate', 'user'],
        order: { createdAt: 'DESC' },
      });

      return { interviews };
    } else {
      const interviews = await Interview.find({
        relations: ['interviewTemplate', 'user'],
        order: { createdAt: 'DESC' },
      });
      return { interviews };
    }
  }

  @Query(() => InterviewSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterview(
    @Arg('id', () => Int) id: number,
  ): Promise<InterviewSingleResponse> {
    const interview = await Interview.findOne({
      where: { id },
      relations: ['interviewTemplate', 'user'],
    });

    if (!interview) {
      return {
        errors: [
          {
            field: 'id',
            message: 'Interview not found',
          },
        ],
      };
    }

    return { interview };
  }

  @Query(() => InterviewSingleResponse)
  @UseMiddleware(isAuth)
  async getCandidateInterview(
    @Ctx() { req }: MyContext,
    @Arg('id', () => Int) id: number,
  ): Promise<InterviewSingleResponse> {
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
      return {
        errors: [
          {
            field: 'id',
            message: 'Interview not found',
          },
        ],
      };
    }

    return { interview };
  }
}
