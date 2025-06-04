import { z } from 'zod';

// Define form schema for interview creation/editing
export const interviewFormSchema = z.object({
  interviewTemplateId: z.string().min(1, {
    message: 'Interview template is required.',
  }),
  candidateId: z.string().min(1, {
    message: 'Candidate is required.',
  }),
  interviewerId: z.string().min(1, {
    message: 'Interviewer is required.',
  }),
  deadline: z
    .date()
    .refine((date) => date > new Date(), {
      message: 'Deadline must be in the future.',
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format.',
    }),
});
