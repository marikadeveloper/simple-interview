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

    await Question.delete({ id });

    return true;
  }
}
