import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InterviewTemplate } from './InterviewTemplate';
import { QuestionBank } from './QuestionBank';

@Entity()
export class InterviewTemplateQuestionBank {
  @PrimaryGeneratedColumn()
  interviewTemplateQuestionBankId: number;

  @Column()
  interviewTemplateId: number;

  @Column()
  questionBankId: number;

  @Column()
  questionCount: number;

  @ManyToOne(
    () => InterviewTemplate,
    (template) => template.interviewTemplateQuestionBanks,
  )
  interviewTemplate: InterviewTemplate;

  @ManyToOne(() => QuestionBank, (bank) => bank.interviewTemplateQuestionBanks)
  questionBank: QuestionBank;
}
