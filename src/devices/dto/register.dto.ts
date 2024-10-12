import { z } from 'zod';

export const registerSchema = z
  .object({
    device_name: z.string(),
    device_topics: z.array(z.string()),
  })
  .partial({
    device_topics: true,
  });

export type RegisterDto = z.infer<typeof registerSchema>;
