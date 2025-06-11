import { z } from 'zod';

// Define form schema for interview template creation/editing
export const questionBankFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});
