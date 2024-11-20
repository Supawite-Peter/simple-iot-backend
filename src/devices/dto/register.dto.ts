import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string(),
    topics: z.array(z.string()),
  })
  .partial({
    topics: true,
  });

export type RegisterDto = z.infer<typeof registerSchema>;
