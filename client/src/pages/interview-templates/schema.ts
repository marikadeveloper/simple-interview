import { z } from 'zod';

// Define form schema for interview template creation/editing
export const interviewTemplateFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
  tags: z.array(z.string()).optional(),
});
