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
import {
  Interview,
  InterviewEvaluation,
  InterviewStatus,
} from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { User, UserRole } from '../../entities/User';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { MyContext } from '../../types';
import { errorStrings } from '../../utils/errorStrings';
import { sendEmail } from '../../utils/sendEmail';
import { generateUniqueSlug } from '../../utils/slugify';
import { InterviewEvaluationInput, InterviewInput } from './interview-types';

@Resolver(Interview)
export class InterviewResolver {
  @FieldResolver(() => User)
  user(@Root() interview: Interview, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(interview.user.id);
  }

  @FieldResolver(() => User)
  interviewer(@Root() interview: Interview, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(interview.interviewer.id);
  }

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

  @FieldResolver(() => InterviewEvaluation, { nullable: true })
  async evaluationValue(
    @Root() interview: Interview,
    @Ctx() { req }: MyContext,
  ): Promise<InterviewEvaluation | null> {
    const userId = req.session.userId;
    // If the user is a candidate, they can not see the evaluation value
    const user: User = (await User.findOneBy({ id: userId })) as User;
    if (user.role === UserRole.CANDIDATE) {
      return null;
    }
    // Otherwise, return the evaluation value
    return interview.evaluationValue || null;
  }

  @FieldResolver(() => String, { nullable: true })
  async evaluationNotes(
    @Root() interview: Interview,
    @Ctx() { req }: MyContext,
  ): Promise<String | null> {
    const userId = req.session.userId;
    // If the user is a candidate, they can not see the evaluation value
    const user: User = (await User.findOneBy({ id: userId })) as User;
    if (user.role === UserRole.CANDIDATE) {
      return null;
    }
    // Otherwise, return the evaluation value
    return interview.evaluationNotes || null;
  }

  @Mutation(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createInterview(
    @Arg('input', () => InterviewInput) input: InterviewInput,
  ): Promise<Interview | null> {
    const interviewTemplate = await InterviewTemplate.findOne({
      where: { id: input.interviewTemplateId },
      relations: ['questions'],
    });

    if (!interviewTemplate) {
      throw new Error(errorStrings.interviewTemplate.notFound);
    }

    if (!interviewTemplate.questions?.length) {
      throw new Error(errorStrings.interview.noQuestions);
    }

    const candidate = await User.findOneBy({ id: input.candidateId });
    if (!candidate) {
      throw new Error(errorStrings.user.notFound);
    }

    const interviewer = await User.findOneBy({ id: input.interviewerId });
    if (!interviewer) {
      throw new Error(errorStrings.user.notFound);
    }

    const slug = await generateUniqueSlug(
      `${candidate.fullName}-${interviewTemplate.name}`,
      async (slug) => {
        const existing = await Interview.findOneBy({ slug });
        return !!existing;
      },
    );

    const interview = await Interview.create({
      interviewTemplate,
      user: candidate,
      interviewer,
      deadline: new Date(input.deadline),
      status: InterviewStatus.PENDING,
      slug,
    }).save();

    // Send email to candidate
    await sendEmail(
      candidate.email,
      'Interview Invitation',
      `You have been invited to an interview. Please log in to your account to start the interview.`,
    );

    return interview;
  }

  @Query(() => [Interview], { nullable: true })
  @UseMiddleware(isAuth)
  async getInterviews(
    @Ctx() { req }: MyContext,
    @Arg('filter', () => String, { nullable: true }) filter?: string,
  ): Promise<Interview[] | null> {
    // admin and interviewer can see all interviews
    // candidate can only see their own interviews
    const userId = req.session.userId;
    // I am sure I have a valid user here
    const user: User = (await User.findOneBy({ id: userId })) as User;

    if (user.role === UserRole.CANDIDATE) {
      const interviews = await Interview.find({
        where: { user: { id: userId } },
        relations: ['interviewTemplate', 'user', 'interviewer'],
        order: { deadline: 'DESC' },
      });
      return interviews;
    } else {
      // Admins and interviewers can filter
      const queryBuilder = Interview.createQueryBuilder('interview')
        .leftJoinAndSelect('interview.interviewTemplate', 'interviewTemplate')
        .leftJoinAndSelect('interview.user', 'user')
        .leftJoinAndSelect('interview.interviewer', 'interviewer')
        .orderBy('interview.deadline', 'DESC');

      if (user.role === UserRole.INTERVIEWER) {
        queryBuilder.where('interview.interviewer = :userId', { userId });
      }

      if (filter && filter.trim() !== '') {
        const filterPattern = `%${filter}%`;
        queryBuilder.andWhere(
          '(user.fullName ILIKE :filter OR interviewTemplate.name ILIKE :filter)',
          { filter: filterPattern },
        );
      }

      const interviews = await queryBuilder.getMany();
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
      relations: [
        'interviewTemplate',
        'interviewTemplate.questions',
        'user',
        'answers',
        'answers.question',
      ],
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    return interview;
  }

  @Query(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async getInterviewBySlug(
    @Arg('slug', () => String) slug: string,
  ): Promise<Interview | null> {
    const interview = await Interview.findOne({
      where: { slug },
      relations: [
        'interviewTemplate',
        'interviewTemplate.questions',
        'user',
        'answers',
        'answers.question',
      ],
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
        'answers.question',
      ],
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    return interview;
  }

  @Query(() => Interview, { nullable: true })
  @UseMiddleware(isAuth)
  async getCandidateInterviewBySlug(
    @Arg('slug', () => String) slug: string,
  ): Promise<Interview | null> {
    const interview = await Interview.findOne({
      where: { slug },
      relations: [
        'interviewTemplate',
        'interviewTemplate.questions',
        'user',
        'answers',
        'answers.question',
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
      relations: ['interviewer', 'user', 'interviewTemplate'],
    });

    if (!interview) {
      return false;
    }

    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();
    await interview.save();

    // Notify the interviewer about the completion via email
    const interviewer = await User.findOneBy({
      id: interview.interviewer.id,
    });
    if (!interviewer) {
      throw new Error(errorStrings.user.notFound);
    }

    const anchorTag = `<a href="${process.env.CLIENT_URL}/interviews/${interview.id}">View Interview</a>`;
    await sendEmail(
      interviewer.email,
      'Interview Completed',
      `${interview.user.fullName} has completed the ${interview.interviewTemplate.name} interview. You can view the interview here: ${anchorTag}`,
    );

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
      relations: ['interviewTemplate', 'user', 'interviewer'],
    });

    const originalInterviewerId = interview?.interviewer?.id;

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    if (interview.status !== InterviewStatus.PENDING) {
      throw new Error(errorStrings.interview.canNotUpdate);
    }

    const { interviewTemplateId, candidateId, deadline, interviewerId } = input;

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

    // Check if interviewer exists
    const interviewer = await User.findOneBy({
      id: interviewerId,
    });
    if (!interviewer) {
      throw new Error(errorStrings.user.notFound);
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
        interviewer: { id: interviewerId },
      },
    );

    if (interviewerId !== originalInterviewerId) {
      // Notify the new interviewer about the interview via email
      const interviewerAnchorTag = `<a href="${process.env.CLIENT_URL}/interviews">See Interviews</a>`;
      await sendEmail(
        interviewer.email,
        'Interview Assigned',
        `You have been assigned to an interview for the ${interviewTemplate.name} position. You can see the interview here: ${interviewerAnchorTag}`,
      );
    }

    return interview;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async evaluateInterview(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => InterviewEvaluationInput)
    input: InterviewEvaluationInput,
  ) {
    const { evaluationValue, evaluationNotes } = input;

    const interview = await Interview.findOne({
      where: { id },
    });

    if (!interview) {
      throw new Error(errorStrings.interview.notFound);
    }

    if (interview.status !== InterviewStatus.COMPLETED) {
      throw new Error(errorStrings.interview.canNotEvaluate);
    }

    interview.evaluationValue = evaluationValue;
    interview.evaluationNotes = evaluationNotes;
    await interview.save();

    return true;
  }
}
