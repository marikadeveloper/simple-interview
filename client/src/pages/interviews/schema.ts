import { z } from 'zod';

// Define form schema for interview creation/editing
export const interviewFormSchema = z.object({
  interviewTemplateId: z.string().min(1, {
    message: 'Interview template is required.',
  }),
  candidateId: z.string().min(1, {
    message: 'Candidate is required.',
  }),
  deadline: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format.',
    })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Date must be in the future.',
    }),
});
